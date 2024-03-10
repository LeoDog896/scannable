import { renderTwoTone } from '../src/qr';

const twoTone = `█▀▀▀▀▀█ ▄█ ▄▄▀▄▄█▀▀▀█ █▀▀▀▀▀█
█ ███ █ ▄█▀█ ▄█▀ ▄▄█▀ █ ███ █
█ ▀▀▀ █ ▄ █ ▀ ▄▄██▀▀█ █ ▀▀▀ █
▀▀▀▀▀▀▀ ▀ ▀ █ █▄▀ ▀▄▀ ▀▀▀▀▀▀▀
█▀▀██ ▀▀▀█▀ ▀ █ █▀ ▄▄▀▄█▄▀ ▀▄
▄█ ▄█ ▀█ █▄█▀  ▀▄▀ ▄▄▀▀▄ ▄ ▄ 
▄▄▄ ▀ ▀▄▀▀▄▀▄█▀▀█▀▄█ ▄▄ ▄▀▀ ▄
▀ █▀▀▄▀▄█   ▄ █▀▄ ▀ █ ██▄▀▀▄ 
█ ██ ▀▀███▄ ▀ ▀█▄▀ ▄▄ ▄█▄▀█ ▄
█ ▀▄ ▀▀▀ █ █▀ ▀██ ▄▄   █▄ ▀▄ 
▀   ▀▀▀ ▄▀▄▀▄▀▄ ▀▀▄ █▀▀▀█▄███
█▀▀▀▀▀█ ▀▀█ ▄ ▀▀▄▀▀██ ▀ █▀▀ ▄
█ ███ █ █ █ ▀ ▀▀██▄▄▀▀▀█▀▄███
█ ▀▀▀ █ █ ▀█▀ █▀█ ██▄ ▀█▀█▀█ 
▀▀▀▀▀▀▀ ▀▀ ▀▀   ▀▀▀▀ ▀ ▀▀▀▀  `;

test('Ensure twotone is valid', () => {
	expect(renderTwoTone('https://www.youtube.com/watch?v=FvyimePmD4E')).toBe(
		twoTone
	);
	expect(
		renderTwoTone({ value: 'https://www.youtube.com/watch?v=FvyimePmD4E' })
	).toBe(twoTone);
});
