use crate::vimlike_list;
use std::collections::HashMap;

#[derive(Clone)]
pub struct Item {
    pub id: u32,
    pub name: String,
    pub children: Vec<Item>,
}

pub struct Tree {
    items: Vec<Item>,
    name_printer: NamePrinter,
    item_extension: ItemExtension,
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

struct AdditinalItemData {
    is_leaf: bool,
}

struct ItemExtension {
    items_hash: HashMap<u32, AdditinalItemData>,
}

impl ItemExtension {
    fn new() -> Self {
        ItemExtension {
            items_hash: HashMap::new(),
        }
    }
}

impl<'a> ItemHandler<'a> for ItemExtension {
    fn handle_item(&mut self, item: &'a Item, _: u32) -> () {
        self.items_hash.insert(item.id, AdditinalItemData { is_leaf: item.children.len() > 0 });
    }

    fn on_finish(&self) -> () {
        for item in &self.items_hash {
            println!(
                "Indexed Item with id {} {}",
                item.0,
                if item.1.is_leaf { "is leaf" } else { "is not leaf" }
            );
        }
    }
}

impl Tree {
    pub fn new(
        items: Vec<Item>,
        key_handler: fn(item: &vimlike_list::Item, code: String) -> bool
    ) -> Self {
        let mut list_items: Vec<vimlike_list::Item> = vec![];
        let mut items_hash: HashMap<u32, Item> = HashMap::new();

        let tree = Tree {
            items,
            name_printer: NamePrinter {},
            item_extension: ItemExtension::new(),
            list: vimlike_list::VimlikeList::new(
                list_items,
                Box::new(KeyHandler::new(key_handler, items_hash.clone())),
            ),
        };

        return tree;
    }

    fn simple_traverse<'a, H: ItemHandler<'a>>(
        &'a self,
        item_handler:  &mut H,
    ) {
        let mut index = 0;
        let mut current_items = vec![&self.items[0]];
        let mut current_root = &self.items;
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

    pub fn init(&mut self) {
        self.simple_traverse(&mut self.item_extension);
    }

    pub fn render(&mut self) {
        self.simple_traverse(&mut self.name_printer);
        //self.list.render();
    }
}
