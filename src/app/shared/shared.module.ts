import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import player from "lottie-web";
import { LottieModule } from "ngx-lottie";
import { ChatbotComponent } from "./components/chatbot/chatbot.component";
import { FormHeaderComponent } from "./components/form-header/form-header.component";
import { ListHeaderComponent } from "./components/list-header/list-header.component";
import { NotifierComponent } from "./components/notifier/notifier.component";
import { CrudDetailComponent } from "./crud/crud-detail.component";
import { CrudFormComponent } from "./crud/crud-form.component";
import { CrudListComponent } from "./crud/crud-list.component";
import { ReplacePipe } from "./pipes/replace.pipe";

// Función requerida por ngx-lottie para cargar animaciones
export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    CrudListComponent,
    CrudDetailComponent,
    CrudFormComponent,
    ChatbotComponent,
    ReplacePipe,
    FormHeaderComponent,
    ListHeaderComponent,
    NotifierComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    LottieModule.forRoot({ player: playerFactory }),
    RouterModule,
  ],
  exports: [
    CrudListComponent,
    CrudDetailComponent,
    CrudFormComponent,
    ChatbotComponent,
    ReplacePipe,
    CommonModule,
    FormsModule,
    FormHeaderComponent,
    ListHeaderComponent,
    NotifierComponent,
  ],
})
export class SharedModule {}
