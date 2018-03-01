# Clarifications

## Styles

-   I don't think we want to use inline styles. Inlining the styles would create a drastically inflated initial HTML file that does not benefit from the advantages of caching.
-   It would be an easy add, but seems unnecessary.


## File Volume

-   Stale JS files will be automatically replaced
-   Unused JS files can be deleted on publish
    -   When a JS template is deleted, the accompanying file will be deleted
    -   When a resolver is changed or deleted, unused template files can be deleted
-   Stale CSS files can be garbage collected when template updates are fully pre-rendered
