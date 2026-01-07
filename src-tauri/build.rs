fn main() {
    if let Ok(path) = dotenvy::dotenv() {
        println!("cargo:rerun-if-changed={}", path.display());
    }

    println!("cargo:rerun-if-env-changed=GITHUB_CLIENT_ID");
    println!("cargo:rerun-if-env-changed=GITHUB_CLIENT_SECRET");

    tauri_build::build()
}
