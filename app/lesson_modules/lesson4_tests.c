#include <stdio.h>

/*
Testfile will check for the following:
1. a is equal to 4,
2. a is an integer (or some 32 bit datatype)
*/
int arraySize = 0;

int sample() {
    //#B

    arraySize = sizeof(myArray)/sizeof(int);
    return myArray;
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
	int maxErrors = 4;
	int errorTests = binaryTests(4);
	errorTests ^= assertEquals(arraySize, 3);
    *arrPtr = sample();
	errorTests ^= (assertEquals(arrPtr[0], 5) << 1);
    errorTests ^= (assertEquals(arrPtr[1], 3) << 2);
    errorTests ^= (assertEquals(arrPtr[2], 10) << 3);
	printf("%d", errorTests);
	return errorTests;
}