use std::io;

use crossterm::{
    cursor,
    event::{read, Event},
    execute,
    style::Print,
    terminal::{self, ClearType},
};

pub struct Item {
    pub id: u32,
    pub name: String,
    pub cursor_position: u16,
}

pub trait AbstractKeyHandler {
    fn handle_key(&self, item: &Item, code: String) -> bool;
}

pub struct KeyHandler {
    key_handler: fn(item: &Item, code: String) -> bool,
}

impl KeyHandler  {
    pub fn new(key_handler: fn(item: &Item, code: String) -> bool) -> Self {
        KeyHandler { key_handler }
    }
}

impl AbstractKeyHandler for KeyHandler  {
    fn handle_key(&self, item: &Item, code: String) -> bool {
        return (self.key_handler)(item, code);
    }
}

pub struct VimlikeList {
    items: Vec<Item>,
    selected_row: u16,
    key_handler: Box<dyn AbstractKeyHandler>,
}

impl VimlikeList {
    pub fn new(items: Vec<Item>, key_handler: Box<dyn AbstractKeyHandler>) -> Self {
        VimlikeList {
            items,
            selected_row: 0,
            key_handler,
        }
    }

    fn update_selection(&self) {
        execute!(
            io::stdout(),
            cursor::MoveTo(self.items[self.selected_row as usize].cursor_position, self.selected_row),
        ).expect("Failed to execute crossterm");
    }

    pub fn render(&mut self) {
        let mut stdout = io::stdout();
        let mut previous_code = String::new();

        execute!(
            stdout,
            terminal::Clear(ClearType::All),
            cursor::MoveTo(0, 0),
        ).expect("Failed to execute crossterm");

        for (index, item) in self.items.iter().enumerate() {
            execute!(
                stdout,
                cursor::MoveTo(0, index as u16),
                Print(format!("{}\n", item.name)),
            ).expect("Failed to execute crossterm");
        }

        execute!(
            stdout,
            cursor::MoveTo(0, self.selected_row),
        ).expect("Failed to execute crossterm");

        loop {
            match read() {
                Ok(value) => {
                    match value {
                        Event::Key(key) => {
                            let pc = previous_code.clone();
                            let code = key.code.to_string();
                            previous_code = code.clone().to_string();

                            if code == "j" {
                                if self.selected_row < self.items.len() as u16 - 1 {
                                    self.selected_row = self.selected_row + 1;
                                }

                                self.update_selection();
                            } else if code == "k" {
                                if self.selected_row > 0 {
                                    self.selected_row = self.selected_row - 1;
                                }

                                self.update_selection();
                            } else if code == "G" {
                                self.selected_row = self.items.len() as u16 - 1;
                                self.update_selection();
                            } else if code == "g" {
                                if pc == "g" {
                                    previous_code = "".to_string();

                                    self.selected_row = 0;
                                    self.update_selection();
                                }
                            } else {
                                if self.key_handler.handle_key(&self.items[self.selected_row as usize], code) {
                                    break;
                                } else {
                                    continue;
                                }
                            }
                        }
                        _ => continue
                    }
                },
                Err(_) => {
                    match execute!(
                        stdout,
                        terminal::Clear(ClearType::All),
                        cursor::MoveTo(0, 0),
                        Print("Failed to read input\n"),
                        cursor::MoveTo(0, 1)
                    ) {
                        Err(_) => break,
                        Ok(_) => {}
                    };

                    break;
                }
            }
        }
    }
}
