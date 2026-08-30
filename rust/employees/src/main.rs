use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

#[derive(Clone)]
struct Employee {
    name: String,
    passport_id: String,
    salary: f64,
}

impl Employee {
    fn set_salary(&mut self, new_salary: f64) {
        self.salary = new_salary;
    }
}

struct Staff {
    by_name: HashMap<String, Rc<RefCell<Employee>>>,
    by_passport_id: HashMap<String, Rc<RefCell<Employee>>>,
}

impl Staff {
    fn new() -> Self {
        Self {
            by_name: HashMap::new(),
            by_passport_id: HashMap::new(),
        }
    }

    fn add_employee(&mut self, employee: Employee) {
        let rc_employee = Rc::new(RefCell::new(employee));
        let name = rc_employee.borrow().name.clone();
        let passport_id = rc_employee.borrow().passport_id.clone();
        self.by_name.insert(name, Rc::clone(&rc_employee));
        self.by_passport_id.insert(passport_id, rc_employee);
    }

    fn get_employee_by_name(&self, name: &str) -> Option<Rc<RefCell<Employee>>> {
        self.by_name.get(name).cloned()
    }

    fn get_employee_by_passport_id(&self, pid: &str) -> Option<Rc<RefCell<Employee>>> {
        self.by_passport_id.get(pid).cloned()
    }
}

fn main() {
    let mut staff = Staff::new();

    staff.add_employee(Employee {
        name: "Alice".to_string(),
        passport_id: "A123".to_string(),
        salary: 45000.0,
    });

    staff.add_employee(Employee {
        name: "Bob".to_string(),
        passport_id: "A124".to_string(),
        salary: 65000.0,
    });

    println!("Before the raise\n");

    // Read via passport ID index
    if let Some(emp) = staff.get_employee_by_passport_id("A123") {
        let emp_ref = emp.borrow();
        println!("{} has salary: {}", emp_ref.name, emp_ref.salary); // Should print 45000.0
    }

    // Read via passport ID index
    if let Some(emp) = staff.get_employee_by_passport_id("A124") {
        let emp_ref = emp.borrow();
        println!("{} has salary: {}", emp_ref.name, emp_ref.salary); // Should print 65000.0
    }

    // Mutate via name index
    if let Some(emp) = staff.get_employee_by_name("Alice") {
        emp.borrow_mut().set_salary(50000.0);
    }

    // Mutate via name index
    if let Some(emp) = staff.get_employee_by_name("Bob") {
        emp.borrow_mut().set_salary(70000.0);
    }

    println!("After the raise\n");

    // Read via passport ID index
    if let Some(emp) = staff.get_employee_by_passport_id("A123") {
        let emp_ref = emp.borrow();
        println!("{} has salary: {}", emp_ref.name, emp_ref.salary); // Should print 50000.0
    }

    // Read via passport ID index
    if let Some(emp) = staff.get_employee_by_passport_id("A124") {
        let emp_ref = emp.borrow();
        println!("{} has salary: {}", emp_ref.name, emp_ref.salary); // Should print 70000.0
    }
}

