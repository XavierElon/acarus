use bcrypt::{hash, DEFAULT_COST};

fn main() {
    let passwords = vec!["admin123", "password123", "demo123", "john123", "jane123"];

    println!("-- Generated bcrypt password hashes");
    for password in passwords {
        match hash(password, DEFAULT_COST) {
            Ok(hash) => println!("Password: {} -> Hash: {}", password, hash),
            Err(e) => println!("Error hashing {}: {}", password, e),
        }
    }
}
