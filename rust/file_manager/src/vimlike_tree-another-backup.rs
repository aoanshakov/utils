use std::collections::HashMap;

pub struct Item {
    pub id: u32,
    pub name: String,
    pub children: Vec<Item>,
}

pub struct Tree {
    items: Vec<Item>,
    item_extensions: Option<HashMap<u32, ItemExtension>>,
}

struct Parent<'a> {
    id: u32,
    items: &'a Vec<Item>,
    last_index: usize,
}

trait ItemHandler {
    fn handle_item(&mut self, item: &Item, depth: u32, parent_id: u32) -> ();
}

struct NamePrinter<'a> {
    item_extensions: &'a Option<HashMap<u32, ItemExtension>>,
}

impl<'a> ItemHandler for NamePrinter<'a> {
    fn handle_item(&mut self, item: &Item, depth: u32, _: u32) -> () {
        let mut indent = String::new();

        for _ in 0..depth {
            indent.push_str("  ");
        }

        println!("{}{}", indent, format!("{}{}", item.name, if match self.item_extensions {
            Some(item_extensions) => match item_extensions.get(&item.id) {
                Some(item_extension) => !item_extension.is_leaf,
                None => false,
            },
            None => false,
        } { "/" } else { "" }));
    }
}

struct ItemExtension {
    is_leaf: bool,
    parent_id: u32,
}

struct ItemExtentor {
    map: HashMap<u32, ItemExtension>,
}

impl ItemExtentor {
    fn new() -> Self {
        ItemExtentor {
            map: HashMap::new(),
        }
    }
}

impl ItemHandler for ItemExtentor {
    fn handle_item(&mut self, item: &Item, _: u32, parent_id: u32) -> () {
        self.map.insert(item.id, ItemExtension {
            parent_id,
            is_leaf: item.children.len() == 0,
        });
    }
}

impl Tree {
    pub fn new(
        items: Vec<Item>,
    ) -> Self {
        let mut tree = Tree {
            items,
            item_extensions: None,
        };
        
        tree.init();
        return tree;
    }

    fn traverse<H: ItemHandler>(
        &self,
        item_handler:  &mut H,
    ) {
        let mut index = 0;
        let mut current_items = vec![&self.items[0]];
        let mut current_root = &self.items;
        let mut root_index = 0;
        let mut depth = 0;
        let mut parents: HashMap<u32, Parent> = HashMap::new();

        while index < current_items.len() {
            item_handler.handle_item(current_items[index], depth, match parents.get(&current_items[index].id) {
                Some(parent) => parent.id,
                None => 0,
            });

            if current_items[index].children.len() > 0 {
                current_items.push(&current_items[index].children[0]);

                for item in &current_items[index].children {
                    parents.insert(item.id, Parent {
                        id: current_items[index].id,
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
    }

    fn init(&mut self) {
        let mut item_extentor = ItemExtentor::new();
        self.traverse(&mut item_extentor);
        self.item_extensions = Some(item_extentor.map);
    }

    pub fn print_item_extensions(&mut self) {
        match &self.item_extensions {
            Some(map) => {
                for item in map {
                    println!(
                        "Indexed Item with id {} {} has parent {}",
                        item.0,
                        if item.1.is_leaf { "is leaf" } else { "is not leaf" },
                        item.1.parent_id,
                    );
                }
            },

            None => {},
        }
    }

    pub fn render(&mut self) {
        let mut name_printer = NamePrinter {
            item_extensions: &self.item_extensions,
        };

        self.traverse(&mut name_printer);
    }
}
