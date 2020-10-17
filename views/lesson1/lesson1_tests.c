#include <stdio.h>

int sample() {
	//#B

	return a;
}

int assertEquals(int a, int b) {
	if (a != b) {
		return 0;
	}
	return 1;
}

int main() {
	int maxErrors = 1;
	int errorSum = 0;
	errorSum += assertEquals(sample(), 4);
	printf("%d", maxErrors - errorSum);
	return 0;
}
