import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDetailComponent } from './page-detail.component';

describe('PageDetailComponent', () => {
    let component: PageDetailComponent;
    let fixture: ComponentFixture<PageDetailComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PageDetailComponent]
        });
        fixture = TestBed.createComponent(PageDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
