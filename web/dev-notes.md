# Flashcard Editor

We are using the Tiptap Editor with WebRTC. This is a low cost solution
because user agents connect peer-to-peer to exchange updates to the card,
and we don't need a server to track the transactions. But it does require some
complicated business logic to manage persistence.

## Deck `writer`
We introduce a `writer` property to the `Deck` interface. This property
stores the `uid` of the user responsible for storing changes to cards in 
the Firestore `cards` collection.

When `ZDeckEditor` mounts, it checks whether the `writer` property is defined.
If it is undefined, `ZDeckEditor` sets the current user as the `writer`, and it
becomes responsible for persistence.

## Managing the collection of TipTap editors

Currently, `ZDeckEditor` holds a single TipTap Editor as state. We need to
change that design. In the new approach `ZDeckEditor` maintains a map of 
Editors indexed by the flashcard `id`.

These Editors are created by 


