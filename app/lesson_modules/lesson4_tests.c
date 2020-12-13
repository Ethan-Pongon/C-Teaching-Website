#include <stdio.h>

/*
Testfile will check for the following:
1. a is equal to 4,
2. a is an integer (or some 32 bit datatype)
*/
int arraySize = 0;
int userArray[3];

int sample() {
    //#B

    arraySize = sizeof(myArray)/sizeof(int);
    if(arraySize == 3){
        int i = 0;
        while(i < 3) {
            userArray[i] = myArray[i];
            i++;
        }
    }
    return arraySize;
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
    sample();
	errorTests ^= assertEquals(arraySize, 3);
	errorTests ^= (assertEquals(userArray[0], 5) << 1);
    errorTests ^= (assertEquals(userArray[1], 3) << 2);
    errorTests ^= (assertEquals(userArray[2], 10) << 3);
	printf("%d", errorTests);
	return errorTests;
}