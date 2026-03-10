#!/usr/bin/env python3
"""Generate AGENTS.md from skills directory."""
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

def generate_agents():
    """Scan skills/ and generate AGENTS.md."""
    skills_dir = Path("skills")
    skills = []

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir() or skill_dir.name.startswith("."):
            continue

        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue

        with open(skill_md) as f:
            content = f.read()

        fm = parse_frontmatter(content)
        skills.append({
            "name": fm.get("name", skill_dir.name),
            "description": fm.get("description", ""),
            "path": f"skills/{skill_dir.name}/SKILL.md"
        })

    output_path = Path("agents/AGENTS.md")
    with open(output_path, "w") as f:
        f.write("# Karis Agent Skills\n\n")
        f.write("Available marketing intelligence skills for AI agents.\n\n")
        f.write("## Skills\n\n")

        for skill in skills:
            f.write(f"### {skill['name']}\n\n")
            f.write(f"{skill['description']}\n\n")
            f.write(f"**Documentation:** [{skill['path']}](../{skill['path']})\n\n")

    print(f"Generated {output_path} with {len(skills)} skills")

if __name__ == "__main__":
    generate_agents()
