
import StarterKit from '@tiptap/starter-kit';
import { CARD_CONTAINER } from './lerniConstants';

export const TIP_TAP_EXTENSIONS = [StarterKit.configure({history: false})];

export const DECK_EDITOR = 'DeckEditor';

export function updateCardFontSize() {
    const container = document.getElementById(CARD_CONTAINER);
    if (container) {
        const target = container.firstChild as HTMLElement | null;
        if (target) {
            const style = target.style;
            let fontSize = parseInt(style.fontSize);
            let clientHeight = target.clientHeight;
            let scrollHeight = target.scrollHeight;
            
            while (scrollHeight > clientHeight) {
                fontSize--;
                style.fontSize = fontSize + "%";
                clientHeight = target.clientHeight;
                scrollHeight = target.scrollHeight;
            }

            const baseFontSizePercent = target.dataset.basefontsize;
            if (baseFontSizePercent) {
                const baseFontSize = parseInt(baseFontSizePercent);
                while (fontSize < baseFontSize) {
                    fontSize++;
                    style.fontSize = fontSize + "%";
                    clientHeight = target.clientHeight;
                    scrollHeight = target.scrollHeight;
                    if (scrollHeight > clientHeight) {
                        fontSize--;
                        style.fontSize = fontSize + "%";
                        break;
                    }
                }
            }
        }
    }
}