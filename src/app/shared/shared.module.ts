import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import player from "lottie-web";
import { LottieModule } from "ngx-lottie";
import { ChatbotComponent } from "./components/chatbot/chatbot.component";
import { CrudDetailComponent } from "./crud/crud-detail.component";
import { CrudFormComponent } from "./crud/crud-form.component";
import { CrudListComponent } from "./crud/crud-list.component";

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
  ],
  imports: [
    CommonModule,
    FormsModule,
    LottieModule.forRoot({ player: playerFactory }),
  ],
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
