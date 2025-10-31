/// Library root for shared functionality

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic_test() {
        assert_eq!(2 + 2, 4);
    }

    #[tokio::test]
    async fn async_test() {
        assert_eq!(1 + 1, 2);
    }
}

