/* Tool created by Christian Galvez for use with
the C-Teaching-Website ONLY. Tool takes a file
 name as the first argument, password as second.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main (int argc, char **argv) {
    if (argc < 2) {
        printf("No file specified!\n");
        return 1;
    }
	if (argc < 3) {
		printf("No password entered!\n");
	}
    FILE *fp = fopen(argv[1], "r+");
    if (fp == NULL) {
        printf("File \"%s\" does not exist!\n", argv[1]);
        return 2;
    }
    char cur;
	int length = 0;
	cur = argv[2][0];
	while (cur != 0) {
		cur = argv[2][++length];
	}
	char password[length];
	memcpy(password, argv[2], length);
    printf("Password length is %i\n", length);
    char curr = fgetc(fp);
    int pIndex = 0;
    while (curr != EOF) {
        curr = curr ^ password[pIndex++];
        if (pIndex >= length) {
            pIndex = 0;
        }
        printf("%c\n", curr);
        fseek(fp, -1, SEEK_CUR);
        fputc(curr, fp);
        curr = fgetc(fp);
    }
    return 0;
}
