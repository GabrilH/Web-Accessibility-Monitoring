import { Component, OnInit } from '@angular/core';
import { Website } from '../website';
import { WebsiteService } from '../website.service';


@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})
export class WebsitesComponent implements OnInit {
  websites: Website[] = [];
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedValidationStatus: string = 'Todos';
  validationStatusOptions: string[] = ['Todos', 'Por avaliar', 'Em avaliação', 'Avaliado', 'Erro na avaliação'];
  filteredWebsites: Website[] = [];

  constructor(private readonly websiteService: WebsiteService) { }

  ngOnInit(): void {
    this.getWebsites();
  }

  getWebsites(): void {
    this.websiteService.getWebsites()
      .subscribe(websites => {
        this.websites = websites
        this.filterWebsitesByValidationStatus();
      });
  }

  addWebsite(url: string): void {
    url = url.trim();
    if (!url) { return; }
    this.websiteService.addWebsite({ url } as Website)
      .subscribe(website => {
        if (website != null)
          this.websites.push(website);
      });
  }

  deleteWebsite(website: Website): void {
    if (website.pages.length > 0) {
      const confirmDelete = confirm('Este website tem páginas. Tem a certeza que deseja apagá-lo e todas as suas páginas?');
      if (!confirmDelete)
        return;
    }

    this.websiteService.deleteWebsite(website._id).subscribe(() => {
      this.websites = this.websites.filter(w => w !== website);
      this.filterWebsitesByValidationStatus();
    });
  }

  sortWebsitesByRegistrationDate(): void {
    this.sortBy = 'registrationDate';
    if (this.sortDirection === 'asc') {
      this.filteredWebsites.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime() || Number.MAX_SAFE_INTEGER;
        const dateB = new Date(b.registrationDate).getTime() || Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      });
      this.sortDirection = 'desc';
    } else {
      this.filteredWebsites.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime() || Number.MIN_SAFE_INTEGER;
        const dateB = new Date(b.registrationDate).getTime() || Number.MIN_SAFE_INTEGER;
        return dateB - dateA;
      });
      this.sortDirection = 'asc';
    }
  }

  sortWebsitesByLastValidationDate(): void {
    this.sortBy = 'lastValidationDate';
    if (this.sortDirection === 'asc') {
      this.filteredWebsites.sort((a, b) => {
        const dateA = new Date(a.lastValidationDate).getTime() || Number.MIN_SAFE_INTEGER;
        const dateB = new Date(b.lastValidationDate).getTime() || Number.MIN_SAFE_INTEGER;
        return dateA - dateB;
      });
      this.sortDirection = 'desc';
    } else {
      this.filteredWebsites.sort((a, b) => {
        const dateA = new Date(a.lastValidationDate).getTime() || Number.MIN_SAFE_INTEGER;
        const dateB = new Date(b.lastValidationDate).getTime() || Number.MIN_SAFE_INTEGER;
        return dateB - dateA;
      });
      this.sortDirection = 'asc';
    }
  }


  sortWebsitesByValidationStatus(): void {
    this.sortBy = 'validationStatus';
    if (this.sortDirection === 'asc') {
      this.filteredWebsites.sort((a, b) => a.validationStatus.localeCompare(b.validationStatus));
      this.sortDirection = 'desc';
    } else {
      this.filteredWebsites.sort((a, b) => b.validationStatus.localeCompare(a.validationStatus));
      this.sortDirection = 'asc';
    }
  }


  filterWebsitesByValidationStatus(): void {
    if (this.selectedValidationStatus === 'Todos' || !this.selectedValidationStatus) {
      this.filteredWebsites = this.websites;
    } else {
      this.filteredWebsites = this.websites.filter(website => website.validationStatus === this.selectedValidationStatus);
    }
  }

  //para decidir a cor do status de validação na tabela
  getValidationStatusClass(status: string): string {
    switch (status) {
      case 'Por avaliar':
        return 'status-por-avaliar';
      case 'Em avaliação':
        return 'status-em-avaliacao';
      case 'Avaliado':
        return 'status-avaliado';
      case 'Erro na avaliação':
        return 'status-erro-avaliacao';
      default:
        return ''; // Se for 'Todos', não aplicar nenhuma classe específica
    }
  }

  getWebsiteRegistrationDate(website: Website): string {
    return website.registrationDate ? new Date(website.registrationDate).toLocaleString() : 'Sem Data de Registo';
  }

  getWebsiteLastValidationDate(website: Website): string {
    return website.lastValidationDate ? new Date(website.lastValidationDate).toLocaleString() : 'Sem Data de Validação';
  }
}
