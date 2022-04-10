interface Required {
	required: (message?: string) => this;
}

interface Min<Value> {
	min(value: Value | string, message?: string): this;
}

interface Max<Value> {
	max(value: Value | string, message?: string): this;
}

interface MinLength {
	minLength(number: number, message?: string): this;
}

interface MaxLength {
	maxLength(number: number, message?: string): this;
}

interface Pattern {
	pattern(regexp: RegExp, message?: string): this;
}

interface Step {
	step(number: number | string, message?: string): this;
}

interface Multiple<Count = void> {
	multiple(count: Count): this;
}

interface NoConstraint {}

export interface FieldAttributes {
	type?: Exclude<keyof FieldOption, 'select' | 'textarea' | 'fieldset'>;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: string | number;
	max?: string | number;
	step?: string | number;
	pattern?: string;
	multiple?: boolean;
}

export interface FieldOption {
	// 'button': NoConstraint;
	checkbox: Required;
	color: NoConstraint;
	date: Required & Min<Date> & Max<Date> & Step;
	datetime: Required & Min<Date> & Max<Date> & Step;
	'datetime-local': Required & Min<Date> & Max<Date> & Step;
	email: Required & MinLength & MaxLength & Pattern;
	fieldset: Multiple<Number>;
	file: Required;
	hidden: NoConstraint;
	// 'image': NoConstraint;
	month: Required & Min<Date> & Max<Date> & Step;
	number: Required & Min<number> & Max<number> & Step;
	password: Required & MinLength & MaxLength & Pattern;
	radio: Required;
	range: Min<number> & Max<number> & Step;
	// 'reset': NoConstraint;
	search: Required & MinLength & MaxLength & Pattern;
	select: Required;
	// 'submit': NoConstraint;
	tel: Required & MinLength & MaxLength & Pattern;
	text: Required & MinLength & MaxLength & Pattern;
	textarea: Required & MinLength & MaxLength;
	time: Required & Min<Date> & Max<Date> & Step;
	url: Required & MinLength & MaxLength & Pattern;
	week: Required & Min<Date> & Max<Date> & Step;
}

const attributesByType: Record<
	keyof FieldOption,
	Array<keyof FieldAttributes>
> = {
	// 'button': [],
	checkbox: ['required'],
	color: [],
	date: ['required', 'minLength', 'maxLength', 'pattern'],
	datetime: ['required', 'minLength', 'maxLength', 'pattern'],
	'datetime-local': ['required', 'minLength', 'maxLength', 'pattern'],
	email: ['required', 'minLength', 'maxLength', 'pattern'],
	fieldset: ['multiple'],
	file: ['required'],
	hidden: [],
	// 'image': [],
	month: ['required', 'minLength', 'maxLength', 'pattern'],
	number: ['required', 'minLength', 'maxLength', 'pattern'],
	password: ['required', 'minLength', 'maxLength', 'pattern'],
	radio: ['required'],
	range: ['min', 'max', 'step'],
	// 'reset': [],
	search: ['required', 'minLength', 'maxLength', 'pattern'],
	select: ['required'],
	// 'submit': [],
	tel: ['required', 'minLength', 'maxLength', 'pattern'],
	text: ['required', 'minLength', 'maxLength', 'pattern'],
	textarea: ['required', 'minLength', 'maxLength'],
	time: ['required', 'minLength', 'maxLength', 'pattern'],
	url: ['required', 'minLength', 'maxLength', 'pattern'],
	week: ['required', 'minLength', 'maxLength', 'pattern'],
};

export interface Constraint {
	type: {
		value: keyof FieldOption;
		message: string | undefined;
	};
	required?: {
		message: string | undefined;
	};
	minLength?: {
		value: number;
		message: string | undefined;
	};
	maxLength?: {
		value: number;
		message: string | undefined;
	};
	min?: {
		value: Date | number;
		message: string | undefined;
	};
	max?: {
		value: Date | number;
		message: string | undefined;
	};
	step?: {
		value: number | string;
		message: string | undefined;
	};
	pattern?: Array<{
		value: RegExp;
		message: string | undefined;
	}>;
	multiple?: {
		value: number | undefined;
		message: string | undefined;
	};
}

const symbol = Symbol('constraints');

export type Field<Type extends keyof FieldOption = keyof FieldOption> =
	FieldOption[Type] & { [symbol]: () => Constraint };

function createField<Type extends keyof FieldOption>(
	type: Type,
	message?: string,
): Field<Type> {
	const supportedAttributes = attributesByType[type];
	const constraint: Constraint = {
		type: { value: type, message: message },
	};

	const field = {
		required(message?: string) {
			constraint.required = { message };
			return field;
		},
		min(value: number | Date, message?: string) {
			constraint.min = { value, message };
			return field;
		},
		max(value: number | Date, message?: string) {
			constraint.max = { value, message };
			return field;
		},
		minLength(value: number, message?: string) {
			constraint.minLength = { value, message };
			return field;
		},
		maxLength(value: number, message?: string) {
			constraint.maxLength = { value, message };
			return field;
		},
		pattern(value: RegExp, message?: string) {
			if (value.global || value.ignoreCase || value.multiline) {
				console.warn(
					`global, ignoreCase, and multiline flags are not supported on the pattern attribute`,
				);
			} else {
				constraint.pattern = (constraint.pattern ?? []).concat({
					value,
					message,
				});
			}

			return field;
		},
		multiple(value?: number) {
			constraint.multiple = { value, message };
			return field;
		},
		[symbol]: () => constraint,
	};

	// @ts-ignore
	return Object.fromEntries(
		[symbol].concat(supportedAttributes).map((key) => [key, field[key]]),
	);
}

/**
 * Helpers for constructing the field constraints
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Constraint_validation#validation-related_attributes
 */
export const f = {
	// button: () => createField('button'),
	checkbox: () => createField('checkbox'),
	color: () => createField('color'),
	date: () => createField('date'),
	// datetime: () => createField('datetime'),
	datetime: () => createField('datetime-local'), // `datetime` is deprecated
	email: (message?: string) => createField('email', message),
	fieldset: () => createField('fieldset'),
	file: () => createField('file'),
	hidden: () => createField('hidden'),
	// image: () => createField('image'),
	month: () => createField('month'),
	number: (message?: string) => createField('number', message),
	password: () => createField('password'),
	radio: () => createField('radio'),
	range: () => createField('range'),
	// reset: () => createField('reset'),
	search: () => createField('search'),
	select: () => createField('select'),
	// submit: () => createField('submit'),
	tel: () => createField('tel'),
	text: () => createField('text'),
	textarea: () => createField('textarea'),
	time: () => createField('time'),
	url: (message?: string) => createField('url', message),
	week: () => createField('week'),
};

export function getConstraint<Type extends keyof FieldOption>(
	field: Field<Type>,
) {
	return field[symbol]();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isElement<T extends HTMLElement>(
	element: any,
	tag: string,
): element is T {
	return !!element && element.tagName.toLowerCase() === tag;
}

export function isInputElement(element: unknown): element is HTMLInputElement {
	return isElement<HTMLInputElement>(element, 'input');
}

export function isSelectElement(
	element: unknown,
): element is HTMLSelectElement {
	return isElement<HTMLSelectElement>(element, 'select');
}

export function isTextareaElement(
	element: unknown,
): element is HTMLTextAreaElement {
	return isElement<HTMLTextAreaElement>(element, 'textarea');
}

export function isButtonElement(
	element: unknown,
): element is HTMLButtonElement {
	return isElement<HTMLButtonElement>(element, 'button');
}

export function isDirtyField(
	element: HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement,
): boolean {
	if (
		isElement<HTMLInputElement>(element, 'input') ||
		isElement<HTMLTextAreaElement>(element, 'textarea')
	) {
		return element.value !== element.defaultValue;
	} else if (isElement<HTMLSelectElement>(element, 'select')) {
		return (
			element.value !==
			Array.from(element.options).find((option) => option.defaultSelected)
				?.value
		);
	} else {
		return false;
	}
}

export function isValidationConstraintSupported(
	element: unknown,
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
	if (
		!isInputElement(element) &&
		!isSelectElement(element) &&
		!isTextareaElement(element)
	) {
		return false;
	}

	return typeof element.checkValidity === 'function';
}

export function shouldSkipValidate(element: unknown) {
	return isButtonElement(element) || isInputElement(element)
		? element.formNoValidate
		: false;
}

function flatten<T>(
	item: any,
	isLeaf: (item: any) => boolean,
	prefix = '',
): Array<[string, T]> {
	let entries: Array<[string, T]> = [];

	if (isLeaf(item)) {
		entries.push([prefix, item]);
	} else if (Array.isArray(item)) {
		for (var i = 0; i < item.length; i++) {
			entries.push(...flatten<T>(item[i], isLeaf, `${prefix}[${i}]`));
		}
	} else {
		for (const [key, value] of Object.entries(item)) {
			entries.push(
				...flatten<T>(value, isLeaf, prefix ? `${prefix}.${key}` : key),
			);
		}
	}

	return entries;
}

function unflatten<T>(
	entries: Array<[string, T]> | Iterable<[string, T]>,
): any {
	const pattern = /(\w+)\[(\d+)\]/;
	const result: any = {};

	for (let [key, value] of entries) {
		let paths = key.split('.').flatMap((key) => {
			const matches = pattern.exec(key);

			if (!matches) {
				return key;
			}

			return [matches[1], Number(matches[2])];
		});
		let length = paths.length;
		let lastIndex = length - 1;
		let index = -1;
		let pointer = result;

		while (pointer != null && ++index < length) {
			let key = paths[index];
			let next = paths[index + 1];
			let newValue = value;

			if (index != lastIndex) {
				newValue = pointer[key] ?? (typeof next === 'number' ? [] : {});
			}

			pointer[key] = newValue;
			pointer = pointer[key];
		}
	}

	return result;
}

function validate(
	value: FormDataEntryValue | undefined,
	constraint: Constraint,
): string | null {
	if (value instanceof File) {
		return 'File is not supported yet';
	}

	if (constraint.required) {
		if (typeof value === 'undefined' || value === '') {
			return constraint.required.message ?? 'This field is required';
		}
	}

	if (constraint.minLength) {
		if (
			typeof value === 'undefined' ||
			value.length < constraint.minLength.value
		) {
			return (
				constraint.minLength.message ??
				`This field must be at least ${constraint.minLength.value} characters`
			);
		}
	}

	if (constraint.maxLength) {
		if (
			typeof value !== 'undefined' &&
			value.length > constraint.maxLength.value
		) {
			return (
				constraint.maxLength.message ??
				`This field must be at most ${constraint.maxLength.value} characters`
			);
		}
	}

	if (constraint.min) {
		if (
			constraint.min.value instanceof Date &&
			new Date(value ?? '') < constraint.min.value
		) {
			return (
				constraint.min.message ??
				`This field must be later than ${constraint.min.value.toISOString()}`
			);
		} else if (
			typeof constraint.min.value === 'number' &&
			Number(value ?? '') < constraint.min.value
		) {
			return (
				constraint.min.message ??
				`This field must be greater than or equal to ${constraint.min.value}`
			);
		}
	}

	if (constraint.max) {
		if (
			typeof value !== 'undefined' &&
			constraint.max.value instanceof Date &&
			new Date(value) > constraint.max.value
		) {
			return (
				constraint.max.message ??
				`This field must be at earlier than ${constraint.max.value.toISOString()}`
			);
		} else if (
			typeof value !== 'undefined' &&
			typeof constraint.max.value === 'number' &&
			Number(value) > constraint.max.value
		) {
			return (
				constraint.max.message ??
				`This field must be less than or equal to ${constraint.max.value}`
			);
		}
	}

	if (constraint.step) {
		// TODO
	}

	if (constraint.type) {
		switch (constraint.type.value) {
			case 'email':
				if (!/^\S+\@\S+$/.test(value ?? '')) {
					return constraint.type.message ?? `This field must be a valid email`;
				}
				break;
			case 'url':
				const isURL = (value: string) => {
					try {
						new URL(value);
						return true;
					} catch {
						return false;
					}
				};
				if (!isURL(value ?? '')) {
					return constraint.type.message ?? `This field must be a valid URL`;
				}
				break;
		}
	}

	if (constraint.pattern?.length) {
		const pattern = constraint.pattern.find((pattern) => {
			const match = value?.match(pattern.value);

			return !match || value !== match[0];
		});

		if (pattern) {
			return pattern.message ?? `This field must be a valid format`;
		}
	}

	return null;
}

export function parse<T>(
	payload: FormData | URLSearchParams | string,
	fieldsetCreator:
		| ((value?: Record<string, any>) => Record<string, T>)
		| Record<string, T>,
): { value: Record<string, any>; error: Record<string, string> | null } {
	const valueEntries: Iterable<[string, FormDataEntryValue]> =
		payload instanceof URLSearchParams || payload instanceof FormData
			? payload
			: new URLSearchParams(payload);
	const value = unflatten(valueEntries);
	const fieldset =
		typeof fieldsetCreator === 'function'
			? fieldsetCreator(value)
			: fieldsetCreator;
	const values = Object.fromEntries(valueEntries);
	const errorEntries: Array<[string, string]> = [];

	for (const [name, field] of flatten<Field>(
		fieldset,
		(f) => typeof f[symbol] === 'function',
	)) {
		const constraint = getConstraint(field);
		const value = values[name];
		const message = validate(value, constraint);

		if (message) {
			errorEntries.push([name, message]);
		}
	}

	return {
		value,
		error: errorEntries.length > 0 ? unflatten(errorEntries) : null,
	};
}
