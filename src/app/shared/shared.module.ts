import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChatbotComponent } from "./components/chatbot/chatbot.component";
import { CrudDetailComponent } from "./crud/crud-detail.component";
import { CrudFormComponent } from "./crud/crud-form.component";
import { CrudListComponent } from "./crud/crud-list.component";

@NgModule({
  declarations: [
    CrudListComponent,
    CrudDetailComponent,
    CrudFormComponent,
    ChatbotComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [
    CrudListComponent,
    CrudDetailComponent,
    CrudFormComponent,
    ChatbotComponent,
    CommonModule,
    FormsModule,
  ],
})
export class SharedModule {}
