# Plan for updating leaf game

## requirements
* 3 Customers
    * Each customer represented as object with props to keep track of states, in an array
        + track on screen position, timer, state (sad, thanks, neutral etc)
        + also store customer order here.
        + store it in a svelte `$state({...})`, so that when we update the game here, frontend is re-rendered
        + customers are stored in an array so that we can do `customer.forEach(... update customer)` during event loop, without making a special case for all 3 customer
* Inventory
    + store inventory as a object/map, to track how many of each item the player has
        ```js
            // obvious make it typescript typesafe...
            inventory = $state({
                apple: 0,
                orange: 0,
                pear: 0
                ...
            })
        ```
    + we store it in a svelte `$state({...})`


