function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Truman Sacco</h1>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#home" className="transition hover:text-foreground">
            Home
          </a>
          <a href="#projects" className="transition hover:text-foreground">
            Projects
          </a>
          <a href="#about" className="transition hover:text-foreground">
            About
          </a>
          <a href="#contact" className="transition hover:text-foreground">
            Contact
          </a>
        </div>

        
      </div>
    </nav>
  )
}

export default Navbar