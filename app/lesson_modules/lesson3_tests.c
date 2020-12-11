#include <stdio.h>

/*
Testfile will check for the following:
1. specialNum returns the value 42,
2. specialNum returns an integer (or 32 bit datatype)
*/

//#B

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
	errorTests ^= (assertEquals(sizeof(specialNum()), 4) << 1);
	errorTests ^= (assertEquals(specialNum(), 42));
	printf("%d", errorTests);
	return errorTests;
}
