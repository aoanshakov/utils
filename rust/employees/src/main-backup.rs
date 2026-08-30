use std::collections::HashMap;

// === Core Structures ===

#[derive(Debug)]
pub struct Employee {
    pub first_name: String,
    pub last_name: String,
    pub position: String,
    pub salary: f32,
}

// === EmployeeHandler Trait ===

pub trait EmployeeHandler<'a> {
    fn handle_employee(&mut self, employee: &'a mut Employee);
}

// === Employees Container ===

pub struct Employees {
    list: Vec<Employee>,
}

impl Employees {
    pub fn new() -> Self {
        Employees { list: vec![] }
    }

    pub fn add(&mut self, first_name: &str, last_name: &str, position: &str, salary: f32) {
        self.list.push(Employee {
            first_name: first_name.to_string(),
            last_name: last_name.to_string(),
            position: position.to_string(),
            salary,
        });
    }

    pub fn each<'a, H: EmployeeHandler<'a>>(&'a mut self, handler: &mut H) {
        for employee in &mut self.list {
            handler.handle_employee(employee);
        }
    }

    pub fn build_lookup<'a>(&'a mut self) -> EmployeeLookup<'a> {
        let mut lookup = EmployeeLookup::new();
        self.each(&mut lookup);
        lookup
    }
}

// === EmployeeLookup ===

pub struct EmployeeLookup<'a> {
    map: HashMap<String, &'a Employee>,
}

impl<'a> EmployeeLookup<'a> {
    pub fn new() -> Self {
        EmployeeLookup {
            map: HashMap::new(),
        }
    }

    pub fn get(&self, name: &str) -> Option<&Employee> {
        self.map.get(name).copied()
    }
}

impl<'a> EmployeeHandler<'a> for EmployeeLookup<'a> {
    fn handle_employee(&mut self, employee: &'a mut Employee) {
        self.map.insert(employee.first_name.clone(), employee);
    }
}

// === NamePrinter ===

pub struct NamePrinter;

impl<'a> EmployeeHandler<'a> for NamePrinter {
    fn handle_employee(&mut self, employee: &'a mut Employee) {
        println!(
            "Name: {} {}, Position: {}, Salary: {}",
            employee.first_name, employee.last_name, employee.position, employee.salary
        );
    }
}

// === SalaryRaise ===

pub struct SalaryRaise {
    amount: f32,
}

impl SalaryRaise {
    pub fn new(amount: f32) -> Self {
        Self { amount }
    }
}

impl<'a> EmployeeHandler<'a> for SalaryRaise {
    fn handle_employee(&mut self, employee: &'a mut Employee) {
        employee.salary += self.amount;
    }
}

// === Company Struct ===

pub struct Company {
    employees: Employees,
}

impl Company {
    pub fn new() -> Self {
        Company {
            employees: Employees::new(),
        }
    }

    pub fn add(&mut self, first_name: &str, last_name: &str, position: &str, salary: f32) {
        self.employees.add(first_name, last_name, position, salary);
    }

    pub fn get_salary(&mut self, name: &str) -> f32 {
        let lookup = self.employees.build_lookup();

        match lookup.get(name) {
            Some(value) => value.salary,
            None => 0 as f32,
        }
    }

    pub fn raise_salary(&mut self, amount: f32) {
        let mut raiser = SalaryRaise::new(amount);
        self.employees.each(&mut raiser);
    }

    pub fn print_employees_data(&mut self) {
        let mut printer = NamePrinter;
        self.employees.each(&mut printer);
    }
}

// === Main Function to Test ===

fn main() {
    let mut company = Company::new();

    company.add("Ivan", "Petrov", "Web Developer", 5000.0);
    company.add("Alexey", "Ivanov", "Product Manager", 7000.0);

    println!("Before salary raise:");
    company.print_employees_data();

    company.raise_salary(1000.0);

    println!("\nAfter salary raise:");
    company.print_employees_data();

    println!(
        "\nLookup: Ivan now has salary {}", company.get_salary("Ivan")
    );

    println!(
        "\nLookup: Alexey now has salary {}", company.get_salary("Alexey")
    );
}
