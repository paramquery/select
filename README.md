# jQuery Multiple Select Plugin

## ParamQuery Select (pqSelect)

Copyright (c) 2015–2026 Paramvir Dhindsa  
Released under the MIT license

ParamQuery Select is a jQuery plugin that converts ordinary multiple and single `<select>` lists into a theme‑ready jQuery UI widget. It supports **virtual rendering** to handle tens of thousands of records without performance loss.

- [API](http://paramquery.com/api/select)  
- [Demos & Examples](http://paramquery.com/select)

---

## Dependencies

- jQuery ≥ 2.2.x
- jQuery ui ≥ 1.12.x
- Include `jquery-ui.structure.css` and a theme file of your choice (themes are not bundled).

---

## Features

- Checkboxes with options in multiple select lists  
- Radio buttons with options in single select lists  
- Search box  
- Grouping via `<optgroup>` tag  
- Disabled options via `disabled` attribute  
- Keyboard navigation  
- Collision/edge detection  
- Bootstrap support (v1.3.0)  
- ThemeRoller ready  
- AMD support (v1.3.0)  
- UMD/ESM builds available (v2.2.0)
- Works in major browsers: Edge, Chrome, Firefox, Safari, Opera

---

## Usage

### Classic jQuery (UMD)

```html
<link rel="stylesheet" href="jquery-ui.structure.css">
<link rel="stylesheet" href="jquery-ui.theme.css">
<link rel="stylesheet" href="pqselect.min.css">

<script src="jquery.js"></script>
<script src="jquery-ui.js"></script>
<script src="pqselect.min.js"></script>

<script>
  $("#mySelect").pqSelect();
</script>
```

### ES Module (ESM)

If you are using modern bundlers like Rollup, Webpack, or Vite, you can import pqSelect directly:

```js
import jQuery from "jquery-ui-pack";
import pq from "./pqselect.mjs";

jQuery("#mySelect").pqSelect( options );
//or
pq.select("#mySelect", options);
```

- `jquery-ui-pack` is a bundled distribution of jQuery UI packaged as ESM/UMD.  
- `pqselect.mjs` is the ES Module build that exports the `pq` namespace.  
- Consumers can simply `import pq` and use it with jQuery.

---

## Notes

- pqSelect integrates seamlessly with jQuery UI themes.  
- For Bootstrap styling, ensure Bootstrap CSS is loaded before pqSelect.  
- Virtual rendering is especially useful for large datasets (10k+ options).
