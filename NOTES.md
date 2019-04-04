
# Thu Apr  4 17:01:11 CEST 2019
- Long time since last update.
- Commited some changes that were not commited yet.
- Minimarker for the map gives error. rectangle method not found. Probably Phaser version needs to be updated.


# Sat Sep 22 14:49:33 CEST 2018
- Rolled back Phaser to v3.12.0. Issue with texture marked as delete when calling `generateTexture`.
- Anchor point for images is in 0.5, 0.5. Good to know!
* Played with snapshot method. Complicated to reuse the image as it was being lazyloaded. image.onload did the trick but after all the result was not very good. Lets generate the map manually.
* Tried generating an size with a real-life size equivalent given a walk speed but TOO big. Need chunking!

# Tue Sep 18 18:28:05 CEST 2018
- Looking for new character atlas to be used as base and replace tuxemon's misa girl.
	- Talking with people in #opengameart found these:
		- Chick: https://opengameart.org/content/chick
		- Base human: https://opengameart.org/content/the-revolution-sprites
	- Quality searches:
		- https://opengameart.org/art-search-advanced?keys=&title=&field_art_tags_tid_op=or&field_art_tags_tid=top%20down%2C%20character&name=&field_art_type_tid[9]=9&field_art_type_tid[10]=10&field_art_type_tid[7273]=7273&field_art_type_tid[14]=14&field_art_type_tid[12]=12&field_art_type_tid[13]=13&field_art_type_tid[11]=11&field_art_licenses_tid[17981]=17981&field_art_licenses_tid[2]=2&field_art_licenses_tid[17982]=17982&field_art_licenses_tid[3]=3&field_art_licenses_tid[6]=6&field_art_licenses_tid[5]=5&field_art_licenses_tid[10310]=10310&field_art_licenses_tid[4]=4&field_art_licenses_tid[8]=8&field_art_licenses_tid[7]=7&sort_by=created&sort_order=DESC&items_per_page=24&collection=&page=2&Collection=
		- https://opengameart.org/content/2dspriteorthogonal


