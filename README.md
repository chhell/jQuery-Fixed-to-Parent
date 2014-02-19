jQuery-Fixed-to-Parent
======================

This plugin allows you to fix a _block_ element to the viewport, much like css fixed positioning `position: "fixed"`, but within the bounds of its parent element. It fixes the target element to the top of the viewport when scrolling down and to the bottom of the viewport when scrolling up.

    $('#sidebar').fixedToParent();

The plugin also provides the following method calls

    $('#sidebar').fixedToParent('unbind');
    $('#sidebar').fixedToParent('rebind');
    $('#sidebar').fixedToParent('unfix'); // Reset to static positioning

The first of these unbinds the _scroll_ and _resize_ bindings that the plugin establishes, and the second of these unbinds and rebinds them.
