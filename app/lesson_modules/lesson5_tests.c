#include <stdio.h>

/*
Testfile will check for the following:
1. myArray can hold 30 ints,
2. All the values of the users array equal 99
*/
int arraySize = 0;
int userArray[30];

int sample() {
    //#B

    arraySize = sizeof(values)/sizeof(int);
    if(arraySize == 30){
        int i = 0;
        while(i < 30) {
            userArray[i] = values[i];
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

int arrayValCheck(){
    if(arraySize != 30){
        return 0;
    }
    else{
        int i = 0;
        while(i < 30) {
            if(userArray[i] != 99) {
                return 0;
            }
            i++;
        }
        return 1;
    }
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
    sample();
	errorTests ^= assertEquals(arraySize, 30);
	errorTests ^= (arrayValCheck() << 1);
	printf("%d", errorTests);
	return errorTests;
}