import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-address',
	templateUrl: './address.component.html',
	styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
	addressForm: FormGroup;
	saved = false;

	constructor(private fb: FormBuilder) {
		this.addressForm = this.fb.group({
			applicationName: ['', Validators.required],
			city: ['', Validators.required],
			phone: ['', [Validators.required, Validators.pattern(/^[0-9()+\-\s]*$/)]]
		});
	}

	ngOnInit(): void {}

	save(): void {
		if (this.addressForm.invalid) {
			this.addressForm.markAllAsTouched();
			return;
		}

		const addr = this.addressForm.value;
		// persist to localStorage as a minimal demo - replace with API call as needed
		const listJson = localStorage.getItem('addresses') || '[]';
		const list = JSON.parse(listJson);
		list.push({ ...addr, savedAt: new Date().toISOString() });
		localStorage.setItem('addresses', JSON.stringify(list));

		this.saved = true;
		setTimeout(() => this.saved = false, 3000);
		this.addressForm.reset();
	}
}

