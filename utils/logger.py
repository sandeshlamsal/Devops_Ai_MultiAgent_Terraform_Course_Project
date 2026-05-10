from rich.console import Console
from rich.theme import Theme

theme = Theme({
    "orchestrator": "bold cyan",
    "researcher": "bold yellow",
    "analyst": "bold green",
    "critic": "bold magenta",
    "info": "dim white",
    "error": "bold red",
})

console = Console(theme=theme)


def log(role: str, message: str):
    console.print(f"[{role}][{role.upper()}][/{role}] {message}")


def log_info(message: str):
    console.print(f"[info]  {message}[/info]")


def log_error(message: str):
    console.print(f"[error]ERROR[/error] {message}")
