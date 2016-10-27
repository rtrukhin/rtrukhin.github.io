# DPO8 Localization

Read Localization content [best practices](https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_content_best_practices).<br/>
Keep localization in sorter order (by localization ID)<br/>
Follow key format rules: (\[\] - required; \{\} - optional)<br/>
\[context\]-\[meaning\]-\{details\}.\{attribute or innerHTML\}<br/>

+ context - defines specific scope of localization usage. For example: action - use for action buttons, context menu items and etc; msg - use for all messages, error \& warnings; component name - localization for specific component
+ meaning - human readable text. Keep it closer to English localization
+ details - defines additional localization sub-scope (text, label, placeholder, hint and etc)
+ attribute or innerHTML - HTML attribute \& write localization direct to innerHTML

##Localization Flow
1. Open Localization.xml file using Microsoft Excel 2007 or later
2. Make changes
3. Save file
4. Run `gulp l10n`

##Questions & Answers<br/>
Q. How can I localize input's placeholder?<br/>
A. Use placeholder attribute after dot. For example: select-product-search.placeholder=Enter product # or description<br/>
<br/>
Q. How can I localize multi line text?<br/>
A. Use innerHTML after dot. It will insert localization as HTML. For example: `multi-line-text.innerHTML=Line1<br/>Line2<br/>Line3`<br/>
<br/>
