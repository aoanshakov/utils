use crate::vimlike_list;
use std::collections::HashMap;

#[derive(Clone)]
pub struct Item {
    pub id: u32,
    pub name: String,
    pub children: Vec<Item>,
}

pub struct Tree<'a> {
    items: &'a Vec<Item>,
    list: vimlike_list::VimlikeList,
}

struct KeyHandler {
    key_handler: fn(item: &vimlike_list::Item, code: String) -> bool,
    items_hash: HashMap<u32, Item>,
}

impl KeyHandler  {
    pub fn new(
        key_handler: fn(item: &vimlike_list::Item, code: String) -> bool,
        items_hash: HashMap<u32, Item>,
    ) -> Self {
        KeyHandler { key_handler, items_hash }
    }
}

impl vimlike_list::AbstractKeyHandler for KeyHandler  {
    fn handle_key(&self, item: &vimlike_list::Item, code: String) -> bool {
        let has_children = match self.items_hash.get(&item.id) {
            Some(value) => value.children.len() > 0,
            None => false,
        };

        if code == "o" && has_children {
            return false;
        }

        return (self.key_handler)(item, code);
    }
}

fn traverse_items(
    list_items: &mut Vec<vimlike_list::Item>,
    items: Vec<Item>,
    items_hash: &mut HashMap<u32, Item>,
    depth: u16
) {
    let mut indent = String::new();

    for _ in 0..depth {
        indent.push_str("  ");
    }

    for item in items {
        let has_children = item.children.len() > 0;
        items_hash.insert(item.id, item.clone());

        list_items.push(vimlike_list::Item {
            id: item.id,
            name: format!("{}{}{}", indent, item.name.clone(), if has_children {"/"} else {""}),
            cursor_position: depth * 2,
        });

        if has_children {
            traverse_items(list_items, item.children, items_hash, depth + 1);
        }
    }
}

struct Parent<'a> {
    items: &'a Vec<Item>,
    last_index: usize,
}

fn simple_traverse<'a>(
    items: &'a Vec<Item>,
    item_handler: &mut Box<dyn ItemHandler<'a> + 'a>
) {
    let mut index = 0;
    let mut current_items = vec![&items[0]];
    let mut current_root = items;
    let mut root_index = 0;
    let mut depth = 0;
    let mut parents: HashMap<u32, Parent> = HashMap::new();

    while index < current_items.len() {
        item_handler.handle_item(current_items[index], depth);

        if current_items[index].children.len() > 0 {
            current_items.push(&current_items[index].children[0]);

            for item in &current_items[index].children {
                parents.insert(item.id, Parent {
                    items: current_root,
                    last_index: root_index,
                });
            }

            current_root = &current_items[index].children;
            root_index = 0;
            depth += 1;
        } else {
            if root_index < current_root.len() - 1 {
                current_items.push(&current_root[root_index + 1]);
                root_index += 1;
            } else if depth != 0 {
                match parents.get(&current_items[index].id) {
                    Some(parent) => {
                        current_root = &parents.get(&current_items[index].id).unwrap().items;
                        depth -= 1;

                        if parent.last_index < current_root.len() - 1 {
                            root_index = parents.get(&current_items[index].id).unwrap().last_index + 1;
                            current_items.push(&current_root[root_index]);
                        }
                    },

                    None => {},
                };
            }
        }

        index += 1;
    }

    item_handler.on_finish();
}

trait ItemHandler<'a> {
    fn handle_item(&mut self, item: &'a Item, depth: u32) -> ();
    fn on_finish(&self) -> ();
}

struct NamePrinter {}

impl<'a> ItemHandler<'a> for NamePrinter {
    fn handle_item(&mut self, item: &'a Item, depth: u32) -> () {
        let mut indent = String::new();

        for _ in 0..depth {
            indent.push_str("  ");
        }

        println!("{}{}", indent, item.name);
    }

    fn on_finish(&self) -> () {}
}

struct Indexer<'a> {
    items_hash: HashMap<u32, &'a Item>,
}

impl<'a> Indexer<'a> {
    fn new() -> Self {
        Indexer {
            items_hash: HashMap::new(),
        }
    }
}

impl<'a> ItemHandler<'a> for Indexer<'a> {
    fn handle_item(&mut self, item: &'a Item, _: u32) -> () {
        self.items_hash.insert(item.id, item);
    }

    fn on_finish(&self) -> () {
        for item in &self.items_hash {
            println!("Indexed {}:{}", item.0, item.1.name);
        }
    }
}

impl<'a> Tree<'a> {
    pub fn new(
        items: &'a Vec<Item>,
        key_handler: fn(item: &vimlike_list::Item, code: String) -> bool
    ) -> Self {
        let mut list_items: Vec<vimlike_list::Item> = vec![];
        let mut items_hash: HashMap<u32, Item> = HashMap::new();

        let mut name_printer: Box<dyn ItemHandler> = Box::new(NamePrinter {});
        let mut indexer: Box<dyn ItemHandler> = Box::new(Indexer::new());

        simple_traverse(items, &mut name_printer);
        simple_traverse(items, &mut indexer);

        return Tree {
            items,
            list: vimlike_list::VimlikeList::new(
                list_items,
                Box::new(KeyHandler::new(key_handler, items_hash.clone())),
            ),
        }
    }

    pub fn render(&mut self) {
        //self.list.render();
    }
}
