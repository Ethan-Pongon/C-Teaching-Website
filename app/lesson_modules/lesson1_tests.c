#include <stdio.h>

/*
Testfile will check for the following:
1. a is equal to 4,
2. a is an integer (or some 32 bit datatype)
*/
int enterSize = 0;

int sample() {
	//#B

	enterSize = sizeof(a);
	return a;
}

int assertEquals(int a, int b) {
	if (a != b) {
		return 0;
	}
	return 1;
}

int binaryTests(int maxTests) {
	short testID = 0;
	for (int i = 0; i < maxTests; i++) {
		testID = testID << 1;
		testID++;
	}
	return testID;
}

int main() {
	int maxErrors = 2;
	int errorTests = binaryTests(2);
	errorTests ^= assertEquals(sample(), 4);
	errorTests ^= (assertEquals(enterSize, 4) << 1);
	printf("%d", errorTests);
	return errorTests;
}
