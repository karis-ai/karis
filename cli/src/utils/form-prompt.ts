import { select, checkbox, confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import type { HitlFormData, HitlFormSection, HitlFormItem } from '../core/agent-interface.js';

function toSnakeCase(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function getDefaultValue(item: HitlFormItem): unknown {
  if (item.type === 'checkbox') return item.value ?? false;
  if (item.type === 'find-keywords') {
    const defaults = (item.default as string[]) ?? [];
    return defaults.flatMap(d => d.split(',').map(k => k.trim())).filter(Boolean);
  }
  const explicit = item.default?.[0] ?? item.value;
  if (explicit !== undefined && explicit !== '') return explicit;
  if ((item.type === 'select' || item.type === 'radio') && item.options?.length) {
    const first = item.options[0];
    return typeof first === 'string' ? first : first.value;
  }
  return '';
}

/**
 * Classify whether an HITL form is a "confirmation" (auto-skippable with --yes)
 * or a "decision" (always requires user input).
 *
 * Confirmation signals: title contains "Confirm", all items have defaults/values.
 */
export function isConfirmationForm(formData: HitlFormData): boolean {
  const title = (formData.title ?? '').toLowerCase();
  if (title.includes('confirm') || title.includes('确认')) return true;

  const items = (formData.sections ?? []).flatMap(s => s.items);
  return items.length > 0 && items.every(i => {
    if (i.type === 'checkbox') return i.value !== undefined;
    if (i.type === 'find-keywords') return (i.default as unknown[])?.length > 0;
    if ((i.default?.[0] ?? '') !== '') return true;
    if (i.value !== undefined && i.value !== '') return true;
    if ((i.type === 'select' || i.type === 'radio') && i.options?.length) return true;
    return false;
  });
}

async function promptCheckboxGroup(
  section: HitlFormSection,
  result: Record<string, unknown>,
): Promise<void> {
  const checkboxItems = section.items.filter(i => i.type === 'checkbox');
  if (checkboxItems.length === 0) return;

  const selected = await checkbox({
    message: section.subtitle || 'Select options',
    choices: checkboxItems.map(item => ({
      name: item.label,
      value: item.label,
      checked: !!item.value,
    })),
  });

  for (const item of checkboxItems) {
    result[toSnakeCase(item.label)] = selected.includes(item.label);
  }
}

async function promptFindKeywords(
  item: HitlFormItem,
): Promise<string[]> {
  const defaults = (item.default as string[]) ?? [];
  const keywords = defaults.flatMap(d => d.split(',').map(k => k.trim())).filter(Boolean);

  if (keywords.length === 0) {
    const raw = await input({ message: item.label });
    return raw.split(',').map(k => k.trim()).filter(Boolean);
  }

  return checkbox({
    message: item.label || 'Select keywords',
    choices: keywords.map(k => ({ name: k, value: k, checked: true })),
  });
}

async function promptItem(
  item: HitlFormItem,
): Promise<unknown> {
  switch (item.type) {
    case 'find-keywords':
      return promptFindKeywords(item);

    case 'input': {
      const defaultVal = item.default?.[0] ?? '';
      return input({
        message: item.label,
        default: defaultVal ? String(defaultVal) : undefined,
      });
    }

    case 'radio':
    case 'select': {
      const choices = (item.options ?? []).map(o => {
        if (typeof o === 'string') return { name: o, value: o };
        return { name: o.label, value: o.value };
      });
      if (choices.length === 0) return input({ message: item.label });
      return select({ message: item.label, choices });
    }

    case 'switch':
      return confirm({
        message: item.label,
        default: !!item.value,
      });

    default:
      return input({ message: item.label });
  }
}

/**
 * Convert an agent form_data schema into terminal prompts and collect user input.
 * In autoConfirm mode, confirmation-type forms are auto-submitted with defaults.
 */
export async function promptForm(
  formData: HitlFormData,
  autoConfirm: boolean = false,
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  if (autoConfirm) {
    for (const section of formData.sections ?? []) {
      for (const item of section.items) {
        result[toSnakeCase(item.label)] = getDefaultValue(item);
      }
    }
    const label = formData.title || 'form';
    if (isConfirmationForm(formData)) {
      console.log(chalk.dim(`[Auto-confirmed: ${label}]`));
    } else {
      console.log(chalk.dim(`[Auto-submitted with defaults: ${label}]`));
    }
    return result;
  }

  if (formData.title) {
    console.log(chalk.bold(`\n◆ ${formData.title}`));
  }

  for (const section of formData.sections ?? []) {
    const checkboxItems = section.items.filter(i => i.type === 'checkbox');
    const otherItems = section.items.filter(i => i.type !== 'checkbox');

    if (checkboxItems.length > 1) {
      await promptCheckboxGroup(section, result);
    } else if (checkboxItems.length === 1) {
      const item = checkboxItems[0];
      result[toSnakeCase(item.label)] = await confirm({
        message: item.label,
        default: !!item.value,
      });
    }

    for (const item of otherItems) {
      const key = toSnakeCase(item.label);
      result[key] = await promptItem(item);
    }
  }

  return result;
}

export type { HitlFormData };
