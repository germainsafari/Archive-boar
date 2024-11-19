import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BotService } from 'src/app/services/bot.service';

@Component({
    selector: 'app-chatbot',
    templateUrl: './chatbot.component.html',
    styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
    name: string = '';
    email: string = '';
    threadId: string = '';
    userId: string = '';
    inputText: string = '';
    conversation: any[] = [
        // { author: 'user', text: 'I have a depression, got divorced last year I can’t put my things together' },
        // { author: 'bot', text: 'Im truly sorry to hear this. It must be incredibly difficult managing these feelings after your divorce. Would it be alright if I asked some questions to understand better if depression might be affecting you?' },
        // { author: 'user', text: 'I have a depression, got divorced last year I can’t put my things together' },
        // { author: 'bot', text: 'Im truly sorry to hear this. It must be incredibly difficult managing these feelings after your divorce. Would it be alright if I asked some questions to understand better if depression might be affecting you?' },
        // { author: 'user', text: 'I have a depression, got divorced last year I can’t put my things together' },
        // { author: 'bot', text: 'Im truly sorry to hear this. It must be incredibly difficult managing these feelings after your divorce. Would it be alright if I asked some questions to understand better if depression might be affecting you?' },
    ];
    questions: string[] = [
        'I have a depression, got divorced last year I can’t put my things together',
        'Help me quit smoking',
        'Give me some recommendations for ADHD disorder',
        'I experienced trauma as a child, could you run a therapy session for me?'
    ];
    chatbotLoading: boolean = false;
    contentLoading: boolean = true;
    showQuestionsBlock = true;
    focused: boolean = false;
    inputControl: FormControl = new FormControl(null);
    hasError: boolean = false;
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    @ViewChild('textarea') private textarea: ElementRef;
    constructor(private botService: BotService, private route: ActivatedRoute) {
    }

    @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            if (event.metaKey && this.inputControl.value?.trim()) {
                console.log('Enter + Command => new line');
                this.textarea.nativeElement.value += '\r\n';
                this.textarea.nativeElement.style.height = 'auto'; // Reset height to recalculate
                this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
            } else {
                event.preventDefault();
                event.stopPropagation();
                this.onAsk(this.inputControl.value);
            }
        }
    }

    ngOnInit(): void {
        this.name = this.route.snapshot.queryParams['name'] || '';
        this.email = this.route.snapshot.queryParams['email'] || '';
        if (!this.name || !this.email) {
            this.hasError = true;
            this.contentLoading = false;
        }
        setTimeout(() => {
            this.scrollToBottom();
        }, 3000);
        if (this.name && this.email) {
            this.botService.startChat(this.name, this.email).subscribe((response: any) => {
                console.log('start chat', response);
                this.threadId = response.thread_id;
                this.userId = response.user_id;
                this.contentLoading = false;
            }, (err) => {
                console.log('Error', err);
                this.contentLoading = false;
            });
        }
    }

    startRecognition(): void {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Your browser does not support Speech Recognition.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';

        // SpeechRecognition |
        recognition.onresult = (event: any) => {
            this.inputText = event.results[0][0].transcript;
            console.log('Hi,', this.inputText);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.start();
        console.log('sss', this.inputText);
    }

    async onAsk(question: string = '') {
        if ((!this.inputControl.value && !question) || this.chatbotLoading) {
            return;
        }
        if (this.textarea.nativeElement.scrollHeight) {
            this.textarea.nativeElement.style.height = 'auto';
            this.textarea.nativeElement.style.height = `30px`;
        }
        console.log('onAsk', this.inputControl.value, this.threadId);
        const message = question || this.inputControl.value;
        this.conversation.push({
            author: 'user',
            text: `${message}`,
        });
        this.scrollToBottom();
        this.inputControl.patchValue('');
        this.showQuestionsBlock = false;
        this.chatbotLoading = true;
        this.botService.askAbout(this.threadId,this.userId, message).subscribe((response: any) => {
            // console.log(response);
            this.chatbotLoading = false;
            this.conversation.push({
                author: 'bot',
                text: response.response,
            });
            this.scrollToBottom();
        }, (err) => {
            console.log('Error', err);
            this.chatbotLoading = false;
            if (err.error === 'No assistant response') {
                this.conversation.push({
                    author: 'bot',
                    text: 'Sorry, I can’t help you with that.',
                });
            }
        });

    }

    onStartConversation(question: string) {
        this.onAsk(question);
        this.showQuestionsBlock = false;
    }

    scrollToBottom(): void {
        setTimeout(() => {
            try {
                this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
                // window.scrollTo(0,document.body.scrollHeight);
            } catch (err) {
            }
        }, 500);
    }

    adjustHeight(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
}
