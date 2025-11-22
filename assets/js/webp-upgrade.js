(function () {
    var ASSET_PATH = 'assets/images/';

    function testWebp(callback) {
        var img = new Image();
        img.onload = img.onerror = function () {
            callback(img.height === 2);
        };
        img.src = 'data:image/webp;base64,UklGRhIAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL6CQbQAA';
    }

    function replaceAssetUrls(value) {
        if (!value || value.indexOf(ASSET_PATH) === -1) {
            return null;
        }

        var replaced = value.replace(/(assets\/images\/[^\s"'()]+?)\.(png|jpe?g)(\?[^"'()\s]*)?/gi, function (_, prefix, __, query) {
            return prefix + '.webp' + (query || '');
        });

        return replaced === value ? null : replaced;
    }

    function swapAttribute(element, attribute) {
        if (!element || !element.hasAttribute(attribute)) {
            return;
        }

        var current = element.getAttribute(attribute);
        var updated = replaceAssetUrls(current);

        if (!updated) {
            return;
        }

        var dataKey = 'original' + attribute.charAt(0).toUpperCase() + attribute.slice(1);
        if (element.dataset && !element.dataset[dataKey]) {
            element.dataset[dataKey] = current;
        }

        element.setAttribute(attribute, updated);
    }

    function updateInlineStyles() {
        var styledElements = document.querySelectorAll('[style*="' + ASSET_PATH + '"]');
        styledElements.forEach(function (el) {
            swapAttribute(el, 'style');
        });
    }

    function updateStyleTags() {
        document.querySelectorAll('style').forEach(function (styleEl) {
            if (!styleEl.textContent || styleEl.textContent.indexOf(ASSET_PATH) === -1) {
                return;
            }

            var updated = replaceAssetUrls(styleEl.textContent);
            if (updated) {
                styleEl.textContent = updated;
            }
        });
    }

    function upgradeImagesToWebp() {
        document.querySelectorAll('img').forEach(function (img) {
            ['src', 'srcset', 'data-src', 'data-srcset', 'data-lazy'].forEach(function (attr) {
                swapAttribute(img, attr);
            });
        });

        document.querySelectorAll('source').forEach(function (source) {
            ['src', 'srcset'].forEach(function (attr) {
                swapAttribute(source, attr);
            });
        });

        document.querySelectorAll('[data-background], [data-bg]').forEach(function (node) {
            ['data-background', 'data-bg'].forEach(function (attr) {
                swapAttribute(node, attr);
            });
        });

        updateInlineStyles();
        updateStyleTags();
    }

    testWebp(function (supported) {
        if (!supported) {
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', upgradeImagesToWebp, { once: true });
        } else {
            upgradeImagesToWebp();
        }
    });
})();
