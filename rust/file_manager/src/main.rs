mod vimlike_list;
mod vimlike_tree;

fn empty_fn(_: &vimlike_list::Item, _: String) -> bool {
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

    let mut tree = vimlike_tree::Tree::new(items);

    tree.render(empty_fn);
    tree.print_item_extensions();

    //terminal::disable_raw_mode().expect("Failed to exit raw mode");
}
