#include <stdio.h>

/*
Testfile will check for the following:
1. myArray can hold 3 ints,
2. myArray[0] is equal to 5,
3. myArray[1] is equal to 3,
4. myArray[2] is equal to 10
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