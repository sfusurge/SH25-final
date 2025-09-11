# Plan for updating leaf game

## requirements
* 3 Customers
    * Each customer represented as object with props to keep track of states, in an array
        + track on screen position, timer
        + also store customer order here.
        + store it in a svelte `$state({...})`, so that when we update the game here, frontend is re-rendered
        + customers are stored in an array so that we can do `customer.forEach(... update customer)` during event loop, without making a special case for all 3 customer
    * When rendering the customer, make the speech bubble a child of the customer component, to ease positioning.
    * Make state changes happen in the frontend code in the component, to simplify state manangement.
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
    + we store it in a svelte `$state({...})` so that whenever it changes, we frontend will auto rerender
* Plant
    + Each plant, pot, and everything related to it should be its own component.
    + plant, pot images, and QTE component should be a child of this "Plant" component.
    + This way image positioning and scaling can all be local/relative to the parent, which will be much easier.
    + Having a big config for position and values of each plant still make sense, but they should be passed to the component as props.
* QTE
    + QTE should a child of the plant component
    + The plant can have a callback event after QTE, or it can modify the global game state, either works.
    + Whenever the plant is clicked on, show QTE, and restock inventory when QTE event triggers.
* Store
    + Again, just make it like
    ```ts
        shop = $state({
            plant1: false,
            plant2: true, //true means unlocked
            plant3: false ...
        })
    ```
    + Then the dialog can read this variable and render accordingly.
* Player
    + Similar to customer, do all the rendering logic in frontend