# Cafe Livre – A Short Story Store

React + Vite storefront for short stories. Data lives in the browser (localStorage), so there is no backend to run.

    cd short_story_store_app
    npm install
    npm run dev

## Demo accounts

| Role   | Username          | Password    |
| ------ | ----------------- | ----------- |
| Buyer  | `reader.demo`     | `reader123` |
| Buyer  | `mira.reads`      | `reader123` |
| Seller | `priya.sundaram`  | `seller123` |
| Admin  | `admin`           | `admin123`  |


## What's in it

- **Sellers**: dashboard (sales, ratings, recent orders), register a story with an uploaded cover, edit, unlist, delete.
- **Buyers**: browse with search, genre and sort; cart; wishlist; 3-step checkout (billing, payment, review); purchase history; "Recommended for me" (friends' picks plus taste-based picks); friends list.
- **Social**: recommend a story to a friend with a note; star rating plus written review per story.
- **Admin**: overview, manage users (change role, suspend, delete), manage stories (edit, unlist, delete).
