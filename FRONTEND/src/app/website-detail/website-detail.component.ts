import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Website } from '../website';
import { Page } from '../page';
import { WebsiteService } from '../website.service';


@Component({
  selector: 'app-website-detail',
  templateUrl: './website-detail.component.html',
  styleUrls: ['./website-detail.component.css']
})
export class WebsiteDetailComponent implements OnInit {
  website: Website | null = null;
  selectedPages: Page[] = [];
  isComponentHidden: boolean = true;
  errors: Map<string, number> = new Map<string, number>();
  errorTypes: Map<string, any> = new Map<string, any>();

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
        this.getWebsitePages(website._id);
      });
    }
  }

  getWebsitePages(websiteId: string): void {
    this.websiteService.getWebsitePages(websiteId).subscribe(pages => {
      if (this.website) {
        this.website.pages = pages;
        this.viewAggregateAccessibilityIndicators();
      }
    });
  }

  addPage(url: string): void {
    if (!url || !this.website?._id) { return; }
    this.websiteService.addWebsitePage(this.website._id, { url } as Page)
      .subscribe(newPage => {
        if (newPage != null && this.website?.pages) {
          this.website.pages.push(newPage);
          this.getWebsite();
        }
      });
  }

  deleteWebsite(website: Website): void {
    if (website.pages.length > 0) {
      const confirmDelete = confirm('Este website tem páginas. Tem a certeza que deseja apagá-lo e todas as suas páginas?');
      if (!confirmDelete)
        return;
    }

    this.websiteService.deleteWebsite(website._id).subscribe(() => {
      this.website = null;
      window.location.href = '/websites';
    });
  }

  deletePage(page: Page): void {
    if (!this.website?._id)
      return;

    this.websiteService.deleteWebsitePage(this.website._id, page._id).subscribe(() => {
      if (this.website?.pages) {
        this.website.pages = this.website.pages.filter(p => p !== page);
        this.getWebsite();
      }
    });
  }

  //para decidir a cor do status de validação na tabela
  getValidationStatusClass(status: string): string {
    switch (status) {
      case 'Por avaliar':
        return 'status-por-avaliar';
      case 'Em avaliação':
        return 'status-em-avaliacao';
      case 'Conforme':
        return 'status-conforme';
      case 'Não Conforme':
        return 'status-nao-conforme';
      case 'Erro na avaliação':
        return 'status-erro-avaliacao';
      default:
        return ''; // Se for 'All', não aplicar nenhuma classe específica
    }
  }

  getWebsiteRegistrationDate(website: Website): string {
    return website.registrationDate ? new Date(website.registrationDate).toLocaleString() : 'Sem Data de Registo';
  }

  getWebsiteLastValidationDate(website: Website): string {
    return website.lastValidationDate ? new Date(website.lastValidationDate).toLocaleString() : 'Sem Data de Validação';
  }

  getPageRegistrationDate(page: Page): string {
    return page.registrationDate ? new Date(page.registrationDate).toLocaleString() : 'Sem Data de Registo';
  }

  getPageLastValidationDate(page: Page): string {
    return page.lastValidationDate ? new Date(page.lastValidationDate).toLocaleString() : 'Sem Data de Validação';
  }

  togglePageSelection(page: Page): void {
    if (this.selectedPages.includes(page)) {
      this.selectedPages = this.selectedPages.filter(p => p !== page);
    } else {
      this.selectedPages.push(page);
    }
  }

  isPageSelected(page: Page): boolean {
    return this.selectedPages.includes(page);
  }

  deleteSelectedPages(): void {

    if (this.selectedPages.length === 0)
      return;

    const confirmDelete = confirm('Tem a certeza que deseja apagar as páginas selecionadas?');
    if (!confirmDelete)
      return;

    this.selectedPages.forEach(page => {
      this.deletePage(page);
    });

    this.selectedPages = [];
  }

  evaluateAccessibility(): void {
    if (!this.website?._id)
      return;

    if (this.selectedPages.length === 0) {
      alert('Selecione pelo menos uma página para avaliar.');
      return;
    }

    this.selectedPages.forEach(page => {
      this.websiteService.updatePageStatus(this.website!._id, page._id, 'Em avaliação').subscribe(() => {
        this.getWebsite();
      });
    });

    this.websiteService.evaluateWebsite(this.website._id, this.selectedPages).subscribe(() => {
      this.selectedPages = [];
      this.getWebsite();
    });
  }

  viewAggregateAccessibilityIndicators(): void {
    if (!this.website?._id)
      return;

    // List of reports (filter out null reports if any)
    let reports = this.website.pages.map(page => page.report).filter(report => report != null);

    this.errors = new Map<string, number>();
    this.errorTypes = new Map<string, any>();

    this.errors.set('totalNoErrors', 0);
    this.errors.set('totalWithErrors', 0);
    this.errors.set('totalWithAErrors', 0);
    this.errors.set('totalWithAAErrors', 0);
    this.errors.set('totalWithAAAErrors', 0);

    reports.forEach(report => {
        if (this.getPageStats(report)) {
          this.errors.set('totalWithErrors', this.errors.get('totalWithErrors')! + 1);
        } else {
          this.errors.set('totalNoErrors', this.errors.get('totalNoErrors')! + 1);
        }
    });
  }

  toggleComponent(): void {
    this.isComponentHidden = !this.isComponentHidden;
  }

  getPageStats(report: any): boolean {

    let hasErrorsA = false;
    let hasErrorsAA = false;
    let hasErrorsAAA = false;

    const modules = ['act-rules', 'wcag-techniques']
    for (const module of modules) {

      const rules = report.modules[module]['assertions'];
      for (const ruleId in rules) {

        if (!Object.hasOwn(rules, ruleId))
          continue;

        const rule = rules[ruleId];
        const metadata = rule['metadata'];

        const failed = metadata.failed;
        if (failed <= 0)
          continue;

        if (!this.errorTypes.has(rule['code'])) {
          this.errorTypes.set(rule['code'], { name: rule['name'], failed: 0});
        }

        this.errorTypes.set(rule['code'], { name: rule['name'], failed: this.errorTypes.get(rule['code']).failed + failed});

        const successCriteria = metadata['success-criteria'];
        for (let sc of successCriteria) {
          if (sc.level === 'A') {
            hasErrorsA = true;
          } else if (sc.level === 'AA') {
            hasErrorsAA = true;
          } else if (sc.level === 'AAA') {
            hasErrorsAAA = true;
          }
        }
      }
    }

    if (hasErrorsA) {
      this.errors.set('totalWithAErrors', this.errors.get('totalWithAErrors')! + 1);
    }
    if (hasErrorsAA) {
      this.errors.set('totalWithAAErrors', this.errors.get('totalWithAAErrors')! + 1);
    }
    if (hasErrorsAAA) {
      this.errors.set('totalWithAAAErrors', this.errors.get('totalWithAAAErrors')! + 1);
    }

    // Returns true if it has any errors, false otherwise
    return hasErrorsA || hasErrorsAA || hasErrorsAAA;
  }

  //create method that generates report and downloads it as a file to the user
  downloadReport(): void {
    if (!this.website?._id)
      return;

    const reportHtml = this.getReport();

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_acessibilidade_${this.website.url}.html`;
    link.click();
  }

  getTotalPages(): number {
    return this.getPageWithNoErrors() + this.getPageWithErrors();
  }

  getPageWithNoErrors(): number {
    return this.errors.get('totalNoErrors')!;
  }

  //round percentage to 2 decimal places
  getPageWithNoErrorsPercentage(): number {
    return Math.round((this.getPageWithNoErrors() / this.getTotalPages()) * 100 * 100) / 100;
  }

  getPageWithErrors(): number {
    return this.errors.get('totalWithErrors')!;
  }

  getPageWithErrorsPercentage(): number {
    return Math.round((this.errors.get('totalWithErrors')! / this.getTotalPages()) * 100 * 100) / 100;
  }

  getPageWithAErrors(): number {
    return this.errors.get('totalWithAErrors')!;
  }

  getPageWithAErrorsPercentage(): number {
    return Math.round((this.errors.get('totalWithAErrors')! / this.errors.get('totalWithErrors')!) * 100 * 100) / 100;
  }

  getPageWithAAErrors(): number {
    return this.errors.get('totalWithAAErrors')!;
  }

  getPageWithAAErrorsPercentage(): number {
    return Math.round((this.errors.get('totalWithAAErrors')! / this.errors.get('totalWithErrors')!) * 100 * 100) / 100;
  }

  getPageWithAAAErrors(): number {
    return this.errors.get('totalWithAAAErrors')!;
  }

  getPageWithAAAErrorsPercentage(): number {
    return Math.round((this.errors.get('totalWithAAAErrors')! / this.errors.get('totalWithErrors')!) * 100 * 100) / 100;
  }

  getTop10ErrorTypes(): any[] {
    return Array.from(this.errorTypes).sort((a, b) => b[1].failed - a[1].failed).slice(0, 10);
  }

  getWebsiteStatus(): string {
    return this.website?.validationStatus ?? 'Por avaliar';
  }

  getReport(): string {
    if (!this.website)
      return '';

    return `
      <html>
        <head>
          <title>Relatório de Acessibilidade ${this.website.url}</title>
        </head>
        <body>
          <h1>Relatório de Acessibilidade ${this.website.url}</h1>
          <div>Total e percentagem de páginas sem erros de acessibilidade: ${this.getPageWithNoErrors()} | ${this.getPageWithNoErrorsPercentage()}%</div>
          <div>Total e percentagem de páginas com erros de acessibilidade: ${this.getPageWithErrors()} | ${this.getPageWithErrorsPercentage()}%</div>
          <div>Total e percentagem de páginas com erros de acessibilidade de nível A: ${this.getPageWithAErrors()} | ${this.getPageWithAErrorsPercentage()}%</div>
          <div>Total e percentagem de páginas com erros de acessibilidade de nível AA: ${this.getPageWithAAErrors()} | ${this.getPageWithAAErrorsPercentage()}%</div>
          <div>Total e percentagem de páginas com erros de acessibilidade de nível AAA: ${this.getPageWithAAAErrors()} | ${this.getPageWithAAAErrorsPercentage()}%</div>
          
          <h2>10 erros de acessibilidade mais comuns nas páginas</h2>
          <table>
            <thead>
              <tr>
                <th>Código do Erro</th>
                <th>Nome do Erro</th>
                <th>Número de Ocorrências</th>
              </tr>
            </thead>
            <tbody>
              ${this.getTop10ErrorTypes().map(([code, { name, failed }]) => `
                <tr>
                  <td>${code}</td>
                  <td>${name}</td>
                  <td>${failed}</td>
                </tr>
              `).join('')}
        </body>
      </html>
    `;
  }

}