import asyncio
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box
import pipeline

console = Console()


def render_result(result):
    console.print()
    console.print(Panel(f"[bold]{result.query}[/bold]", title="Query", border_style="blue"))

    # Subtasks
    table = Table(title="Research Subtasks", box=box.SIMPLE_HEAVY)
    table.add_column("ID", style="dim")
    table.add_column("Title", style="cyan")
    table.add_column("Focus Areas")
    for s in result.subtasks:
        table.add_row(s.id, s.title, ", ".join(s.focus_areas))
    console.print(table)

    # Findings
    table = Table(title="Research Findings", box=box.SIMPLE_HEAVY)
    table.add_column("Title", style="yellow")
    table.add_column("Confidence", justify="center")
    table.add_column("Key Points")
    for f in result.findings:
        table.add_row(
            f.title,
            f"{f.confidence:.0%}",
            "\n".join(f"• {p}" for p in f.key_points[:3]),
        )
    console.print(table)

    # Analysis
    console.print(Panel(
        f"[bold]Executive Summary[/bold]\n{result.analysis.executive_summary}\n\n"
        f"[bold]Conclusions[/bold]\n{result.analysis.conclusions}",
        title="Analysis Report",
        border_style="green",
    ))

    console.print(Panel(
        "\n".join(f"[green]✓[/green] {r}" for r in result.analysis.recommendations),
        title="Recommendations",
        border_style="green",
    ))

    # Critique
    score_color = "green" if result.critique.overall_score >= 7 else "yellow" if result.critique.overall_score >= 5 else "red"
    console.print(Panel(
        f"[bold]Score: [{score_color}]{result.critique.overall_score}/10[/{score_color}][/bold]\n\n"
        f"[bold]Strengths[/bold]\n" + "\n".join(f"+ {s}" for s in result.critique.strengths) + "\n\n"
        f"[bold]Weaknesses[/bold]\n" + "\n".join(f"- {w}" for w in result.critique.weaknesses) + "\n\n"
        f"[bold]Gaps[/bold]\n" + "\n".join(f"? {g}" for g in result.critique.gaps),
        title="Critic Review",
        border_style="magenta",
    ))


async def main():
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "The impact of AI on software development"
    result = await pipeline.run(query)
    render_result(result)


if __name__ == "__main__":
    asyncio.run(main())
