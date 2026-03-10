#!/usr/bin/env python3
"""Generate marketplace.json from skills directory."""
import json
import re
from pathlib import Path

def parse_frontmatter(content):
    """Extract frontmatter from SKILL.md."""
    if not content.startswith("---"):
        return {}

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}

    frontmatter = {}
    for line in parts[1].strip().split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            frontmatter[key.strip()] = value.strip()

    return frontmatter

def generate_marketplace():
    """Scan skills/ and generate marketplace.json."""
    skills_dir = Path("skills")
    plugins = []

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir() or skill_dir.name.startswith("."):
            continue

        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue

        with open(skill_md) as f:
            content = f.read()

        fm = parse_frontmatter(content)

        plugins.append({
            "name": fm.get("name", skill_dir.name),
            "source": f"./skills/{skill_dir.name}",
            "skills": "./",
            "description": fm.get("description", ""),
            "keywords": [],
            "category": "marketing",
            "version": fm.get("version", "1.0.0")
        })

    marketplace = {
        "name": "karis",
        "owner": {
            "name": "Karis AI",
            "email": "hello@karis.im"
        },
        "metadata": {
            "description": "AI-powered marketing intelligence for brand analysis, content strategy, and competitive research",
            "version": "0.1.0"
        },
        "plugins": plugins
    }

    output_path = Path(".claude-plugin/marketplace.json")
    with open(output_path, "w") as f:
        json.dump(marketplace, f, indent=2)

    print(f"Generated {output_path} with {len(plugins)} skills")

if __name__ == "__main__":
    generate_marketplace()
