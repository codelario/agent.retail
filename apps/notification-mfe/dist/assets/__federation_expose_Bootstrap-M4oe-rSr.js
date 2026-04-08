import { r as importShared } from "./_virtual___federation_fn_import-C1VJuekj.js";
import { r as require_client, t as NotificationBanner } from "./NotificationBanner-BuniUnsp.js";
//#region ../../node_modules/.pnpm/@r2wc+core@1.3.1/node_modules/@r2wc/core/dist/core.js
var import_client = require_client();
var C = {
	stringify: (t) => t ? "true" : "false",
	parse: (t) => /^[ty1-9]/i.test(t)
}, O = {
	stringify: (t) => t.name,
	parse: (t, e, c) => {
		const n = (() => {
			if (typeof window < "u" && t in window) return window[t];
			if (typeof global < "u" && t in global) return global[t];
		})();
		return typeof n == "function" ? n.bind(c) : void 0;
	}
}, j = {
	stringify: (t) => JSON.stringify(t),
	parse: (t) => JSON.parse(t)
};
function k(t) {
	return t.replace(/([a-z0-9])([A-Z])/g, (e, c, n) => `${c}-${n.toLowerCase()}`);
}
function N(t) {
	return t.replace(/[-:]([a-z])/g, (e, c) => `${c.toUpperCase()}`);
}
var S = /* @__PURE__ */ Symbol.for("r2wc.bound"), w = {
	string: {
		stringify: (t) => t,
		parse: (t) => t
	},
	number: {
		stringify: (t) => `${t}`,
		parse: (t) => parseFloat(t)
	},
	boolean: C,
	function: O,
	method: { parse: (t, e, c) => {
		const n = N(e), u = c;
		if (typeof u < "u" && n in u && typeof u[n] < "u") {
			let a = u[n];
			return S in u[n] || (a = a.bind(u), Object.defineProperty(a, S, { value: !0 })), a;
		} else return;
	} },
	json: j
}, b = /* @__PURE__ */ Symbol.for("r2wc.render"), y = /* @__PURE__ */ Symbol.for("r2wc.connected"), h = /* @__PURE__ */ Symbol.for("r2wc.context"), p = /* @__PURE__ */ Symbol.for("r2wc.props");
function T(t, e, c) {
	e.props || (e.props = t.propTypes ? Object.keys(t.propTypes) : []), e.events || (e.events = []);
	const n = Array.isArray(e.props) ? e.props.slice() : Object.keys(e.props), u = Array.isArray(e.events) ? e.events.slice() : Object.keys(e.events), a = {}, A = {}, d = {}, m = {};
	for (const r of n) {
		a[r] = Array.isArray(e.props) ? "string" : e.props[r];
		const s = k(r);
		d[r] = s, m[s] = r;
	}
	for (const r of u) A[r] = Array.isArray(e.events) ? {} : e.events[r];
	class v extends HTMLElement {
		static get observedAttributes() {
			return Object.keys(m);
		}
		[y] = !0;
		[h];
		[p] = {};
		container;
		constructor() {
			super(), e.shadow ? this.container = this.attachShadow({ mode: e.shadow }) : this.container = this, this[p].container = this.container;
			for (const s of n) {
				const l = d[s], o = this.getAttribute(l), i = a[s], f = i ? w[i] : null;
				f?.parse && (o || i === "method") && (this[p][s] = f.parse(o, l, this));
			}
			for (const s of u) this[p][s] = (l) => {
				const o = s.replace(/^on/, "").toLowerCase();
				this.dispatchEvent(new CustomEvent(o, {
					detail: l,
					...A[s]
				}));
			};
		}
		connectedCallback() {
			this[y] = !0, this[b]();
		}
		disconnectedCallback() {
			this[y] = !1, this[h] && c.unmount(this[h]), delete this[h];
		}
		attributeChangedCallback(s, l, o) {
			const i = m[s], f = a[i], g = f ? w[f] : null;
			i in a && g?.parse && (o || f === "method") && (this[p][i] = g.parse(o, s, this), this[b]());
		}
		[b]() {
			this[y] && (this[h] ? c.update(this[h], this[p]) : this[h] = c.mount(this.container, t, this[p]));
		}
	}
	for (const r of n) {
		const s = d[r], l = a[r];
		Object.defineProperty(v.prototype, r, {
			enumerable: !0,
			configurable: !0,
			get() {
				return this[p][r];
			},
			set(o) {
				this[p][r] = o;
				const i = l ? w[l] : null;
				if (i?.stringify) {
					const f = i.stringify(o, s, this);
					this.getAttribute(s) !== f && (f == null ? this.removeAttribute(s) : this.setAttribute(s, f));
				} else r in a && i?.parse && (o || l === "method") && (this[p][r] = i.parse(o, s, this)), this[b]();
			}
		});
	}
	return v;
}
//#endregion
//#region ../../node_modules/.pnpm/@r2wc+react-to-web-component@2.1.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@r2wc/react-to-web-component/dist/react-to-web-component.js
var o = await importShared("react");
function f(t, e, r) {
	const n = (0, import_client.createRoot)(t), u = o.createElement(e, r);
	return n.render(u), {
		root: n,
		ReactComponent: e
	};
}
function i({ root: t, ReactComponent: e }, r) {
	const n = o.createElement(e, r);
	t.render(n);
}
function a({ root: t }) {
	t.unmount();
}
function s(t, e = {}) {
	return T(t, e, {
		mount: f,
		update: i,
		unmount: a
	});
}
//#endregion
//#region src/bootstrap-export.tsx
var NotificationWebComponent = s(NotificationBanner, { props: { message: "string" } });
customElements.define("learning-notification", NotificationWebComponent);
//#endregion
