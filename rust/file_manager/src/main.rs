use std::io;
mod vimlike_list;
mod vimlike_tree;

use crossterm::{
    cursor,
    execute,
    style::Print,
    terminal::{self, ClearType},
};

fn handle_key(item: &vimlike_list::Item, code: String) -> bool {
    let mut stdout = io::stdout();

    if code == "q" {
        execute!(
            stdout,
            terminal::Clear(ClearType::All),
            cursor::MoveTo(0, 0),
            Print("Goodbye!\n"),
            cursor::MoveTo(0, 1),
        ).expect("Failed to execute crossterm");

        return true;
    } else if code == "o" {
        execute!(
            stdout,
            terminal::Clear(ClearType::All),
            cursor::MoveTo(0, 0),
            Print(format!("You selected item # {}", item.id)),
            cursor::MoveTo(0, 1),
        ).expect("Failed to execute crossterm");

        return true;
    }

    return false;
}

fn main() {
    /*
    let mut stdout = io::stdout();

    terminal::enable_raw_mode().expect("Failed to enter raw mode");

    execute!(
        stdout,
        terminal::Clear(ClearType::All),
        cursor::MoveTo(0, 0),
    ).expect("Failed to execute crossterm");
    */

    let items = vec![vimlike_tree::Item {
        id: 42,
        name: "item_42".to_string(),
        children: vec![],
    }, vimlike_tree::Item {
        id: 68,
        name: "item_68".to_string(),
        children: vec![vimlike_tree::Item {
            id: 12,
            name: "item_12".to_string(),
            children: vec![],
        }, vimlike_tree::Item {
            id: 26,
            name: "item_26".to_string(),
            children: vec![vimlike_tree::Item {
                id: 13,
                name: "item_13".to_string(),
                children: vec![],
            }, vimlike_tree::Item {
                id: 14,
                name: "item_14".to_string(),
                children: vec![],
            }],
        }, vimlike_tree::Item {
            id: 82,
            name: "item_82".to_string(),
            children: vec![],
        }],
    }, vimlike_tree::Item {
        id: 27,
        name: "item_27".to_string(),
        children: vec![],
    }];

    let mut tree = vimlike_tree::Tree::new(&items, handle_key);
    tree.render();
    //terminal::disable_raw_mode().expect("Failed to exit raw mode");
}
