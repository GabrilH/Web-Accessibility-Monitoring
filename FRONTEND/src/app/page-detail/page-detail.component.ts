import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Website } from '../website';
import { Page } from '../page';
import { WebsiteService } from '../website.service';

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css']
})

export class PageDetailComponent implements OnInit {
  website: Website | null = null;
  page: Page | null = null;
  tests: any[] = [];
  filteredTests: any[] = [];

  typeACTSelected = true;
  typeWCAGSelected = true;

  passedSelected = true;
  failedSelected = true;
  warningSelected = true;
  inapplicableSelected = false;

  levelASelected = true;
  levelAASelected = true;
  levelAAASelected = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly websiteService: WebsiteService
  ) { }

  ngOnInit(): void {
      this.getWebsite();
  }

  getWebsite(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
    this.websiteService.getWebsite(id).subscribe(website => {
        this.website = website;
        this.getPage();
    });
    }
  }

  getPage(): void {
    const websiteId = this.route.snapshot.paramMap.get('id');
    const pageId = this.route.snapshot.paramMap.get('pageId');
    if (pageId) {
      this.websiteService.getWebsitePage(websiteId, pageId).subscribe(page => {
        this.page = page;
        this.getPageStats(page.report);
        this.filterTests();
      });
    }
  }

  getPageRegistrationDate(page: Page): string {
      return page.registrationDate ? new Date(page.registrationDate).toLocaleString() : 'Sem Data de Registo';
  }

  getPageLastValidationDate(page: Page): string {
      return page.lastValidationDate ? new Date(page.lastValidationDate).toLocaleString() : 'Sem Data de Validação';
  }

  getPageValidationStatus(): string {
      return this.page?.validationStatus ?? 'Por avaliar';
  }

  evaluateAccessibility(): void {
    if (!this.website || !this.page) {
      return;
    }
  
    const websiteId = this.website._id;
    const page = this.page;
    
    this.websiteService.updatePageStatus(websiteId, page._id, 'Em avaliação').subscribe(() => {

      //update page
      this.getPage();
      // this.filteredTests = [];

      this.websiteService.evaluateWebsite(websiteId, [page]).subscribe(() => {
        //update page
        this.getPage();
      });
    });
  }
  
  
  getPageStats(report: any): void {

    this.tests = [];
    if (!report)
      return;

    const modules = ['act-rules', 'wcag-techniques']
    for (const module of modules) {

      const rules = report.modules[module]['assertions'];

      for (const ruleId in rules) {

        if (!Object.hasOwn(rules, ruleId))
          continue;

        const test = {
          isHidden: true,
          type: module,
          code: '',
          description: '',
          result: '',
          levels: new Set(),
          elements: Array<{ target: any; verdict: string; description: string }>()
        };

        const rule = rules[ruleId];
        test.code = rule['code'];
        test.description = rule['description'];

        const metadata = rule['metadata'];
        test.result = metadata['outcome'];

        const successCriteria = metadata['success-criteria'];
        successCriteria.forEach((sc: any) => {
          test.levels.add(sc.level);
        });

        // Ignorar regras sem levels
        if (test.levels.size === 0)
          continue;

        const ruleResults = rule['results'];
        ruleResults.forEach((result: any) => {
          result['elements'].forEach((element: any) => {
            test.elements.push({
              target: element['htmlCode'],
              verdict: result['verdict'],
              description: result['description']
            });
          });
        });

        this.tests.push(test);
      }
    }

    console.log(this.tests);
  }

  filterTests(): void {
    
    let tempFiltered = this.tests

    if (!this.typeACTSelected)
      tempFiltered = tempFiltered.filter((test) => test.type !== 'act-rules');

    if (!this.typeWCAGSelected)
      tempFiltered = tempFiltered.filter((test) => test.type !== 'wcag-techniques');

    if (!this.passedSelected)
      tempFiltered = tempFiltered.filter((test) => test.result !== 'passed');

    if (!this.failedSelected)
      tempFiltered = tempFiltered.filter((test) => test.result !== 'failed');

    if (!this.warningSelected)
      tempFiltered = tempFiltered.filter((test) => test.result !== 'warning');

    if (!this.inapplicableSelected)
      tempFiltered = tempFiltered.filter((test) => test.result !== 'inapplicable');

    let temp2Filtered = []
    if (this.levelASelected)
      temp2Filtered.push(...tempFiltered.filter((test) => test.levels.has('A')));

    if (this.levelAASelected)
      temp2Filtered.push(...tempFiltered.filter((test) => test.levels.has('AA')));

    if (this.levelAAASelected)
      temp2Filtered.push(...tempFiltered.filter((test) => test.levels.has('AAA')));

    this.filteredTests = temp2Filtered;
  }

  getPassedTestsTotal(): number {
    return this.tests.filter((test) => test.result === 'passed').length;
  }

  //round percentage to 2 decimal places
  getPassedTestsPercentage(): number {
    return Math.round((this.getPassedTestsTotal() / this.tests.length) * 100 * 100) / 100;
  }

  getFailedTestsTotal(): number {
    return this.tests.filter((test) => test.result === 'failed').length;
  }

  getFailedTestsPercentage(): number {
    return Math.round((this.getFailedTestsTotal() / this.tests.length) * 100 * 100) / 100;
  }

  getWarningTestsTotal(): number {
    return this.tests.filter((test) => test.result === 'warning').length;
  }

  getWarningTestsPercentage(): number {
    return Math.round((this.getWarningTestsTotal() / this.tests.length) * 100 * 100) / 100;
  }

  getInapplicableTestsTotal(): number {
    return this.tests.filter((test) => test.result === 'inapplicable').length;
  }

  getInapplicableTestsPercentage(): number {
    return Math.round((this.getInapplicableTestsTotal() / this.tests.length) * 100 * 100) / 100;
  }

  deletePage(): void {
    if (!this.website?._id)
      return;

    if (!this.page?._id)
      return;

    const confirmDelete = confirm('Tem a certeza que deseja eliminar esta página?');
    if (!confirmDelete)
      return;

    this.websiteService.deleteWebsitePage(this.website._id, this.page._id).subscribe(() => {
      window.location.href = `/website/${this.website?._id}`;
    });
  }

  toggleHidden(test: any): void {
    test.isHidden = !test.isHidden;
  }

  setToString(set: Set<any>): string {
    return Array.from(set).join(', ');
  }

  isArrayEmpty(array: any[]): boolean {
    return array.length === 0;
  }
}