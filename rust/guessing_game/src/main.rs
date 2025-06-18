use std::io;
use rand::Rng;
use std::cmp::Ordering;

use crossterm::{
    cursor,
    event::{read, Event, KeyCode},
    execute,
    style::Print,
    terminal::{self, ClearType},
};

struct Item {
    id: u32,
    name: String,
}

struct VimlikeList {
    items: Vec<Item>,
    selected_row: u32,
}

impl VimlikeList {
    fn new(items: Vec<Item>) -> Self {
        VimlikeList {
            items,
            selected_row: 0,
        }
    }

    fn render() {
    }
}

fn read_number(row: u16) -> Result<u16, String> {
    let mut actual_value: u16 = 0;
    let mut stdout = io::stdout();
    let mut digits_count: u16 = 0;

    let input_request = "Input number from 1 to 100: ".to_string();
    let input_request_len = input_request.len() as u16;

    match execute!(
        stdout,
        cursor::MoveTo(0, row),
        Print(&input_request),
        cursor::MoveTo(input_request_len, row),
    ) {
        Err(_) => return Err("Failed to execute crossterm".to_string()),
        Ok(_) => {}
    }

    loop {
        match read() {
            Ok(value) => {
                match value {
                    Event::Key(key) => {
                        if key.code.to_string() == "q" {
                            return Err("quit".to_string());
                        }

                        if key.code == KeyCode::Backspace {
                            actual_value = actual_value / 10;

                            if digits_count > 0 {
                                digits_count = digits_count - 1;
                            }

                            match execute!(
                                stdout,
                                terminal::Clear(ClearType::CurrentLine),
                                cursor::MoveTo(0, row),
                                Print(format!(
                                    "{}{}",
                                    &input_request,
                                    (if actual_value == 0 { "".to_string() } else { actual_value.to_string() })
                                )),
                                cursor::MoveTo(input_request_len + digits_count, row),
                            ) {
                                Err(_) => return Err("Failed to execute crossterm".to_string()),
                                Ok(_) => {}
                            }
                        } else {
                            let digit: i16 = match key.code.to_string().parse() {
                                Ok(value) => value,
                                Err(_) => -1
                            };

                            if digit == -1 || actual_value > 10 {
                                return Ok(actual_value);
                            }

                            actual_value = actual_value * 10 + digit as u16;
                            digits_count = digits_count + 1;

                            match execute!(
                                stdout,
                                Print(digit),
                                cursor::MoveTo(input_request_len + digits_count, row),
                            ) {
                                Err(_) => return Err("Failed to execute crossterm".to_string()),
                                Ok(_) => {}
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
                    Err(_) => return Err("Failed to execute crossterm".to_string()),
                    Ok(_) => {}
                };

                return Ok(0);
            }
        }
    }
}

fn main() {
    let expected_value: u16 = rand::thread_rng().gen_range(1..=100);
    let mut stdout = io::stdout();
    let mut row: u16 = 0;

    terminal::enable_raw_mode().expect("Failed to enter raw mode");

    execute!(
        stdout,
        terminal::Clear(ClearType::All),
        cursor::MoveTo(0, 0),
    ).expect("Failed to execute crossterm");

    loop {
        let actual_value = match read_number(row) {
            Ok(value) => value,

            Err(_) => {
                execute!(
                    stdout,
                    terminal::Clear(ClearType::All),
                    cursor::MoveTo(0, 0),
                    Print("Goodbye!\n"),
                    cursor::MoveTo(0, 1),
                ).expect("Failed to execute crossterm");

                break;
            }
        };

        row = 1;

        let expectation = match expected_value.cmp(&actual_value) {
            Ordering::Less =>  "less".to_string(),
            Ordering::Greater => "more".to_string(),
            Ordering::Equal => {
                execute!(
                    stdout,
                    terminal::Clear(ClearType::All),
                    cursor::MoveTo(0, 0),
                    Print(format!("Yes, it is {expected_value}\n")),
                    cursor::MoveTo(0, 1),
                ).expect("Failed to execute crossterm");

                break;
            }
        };

        execute!(
            stdout,
            terminal::Clear(ClearType::All),
            cursor::MoveTo(0, 0),
            Print(format!("Expected value is {expectation} than inputed value {actual_value}\n")),
        ).expect("Failed to execute crossterm");
    }

    terminal::disable_raw_mode().expect("Failed to exit raw mode");
}
