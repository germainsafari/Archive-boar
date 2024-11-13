import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class BotService {
    constructor(
        private http: HttpClient,
    ) {}

    startChat(name: string, email: string) {
        return this.http
            .post(`${environment.botsUrl}/start`, {
                name,
                email,
            })
    }

    askAbout(threadId: string, userId: string, text: string) {
        return this.http
            .post(`${environment.botsUrl}/ask`, {
                thread_id: threadId,
                user_id: userId,
                text,
            })
    }

}
