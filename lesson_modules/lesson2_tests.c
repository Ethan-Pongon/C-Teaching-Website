#include <stdio.h>


/*
Testfile will check for the following:
1. a is of size 4
2. b is of size 4,
3. c is of size 1,
4. a is equal to 5,
5. b is equal to 7,
6. c is equal to 12,
7. c is equal to a + b
*/
// Check if a, b are integers, c is char
int aSize = 0;
int bSize = 0;
int cSize = 0;
int arec = 0;
int brec = 0;

char sample() {
	//#B
	arec = a;
	brec = b;
	aSize = sizeof(a);
	bSize = sizeof(b);
	cSize = sizeof(c);
	return c;
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
	int maxErrors = 7;
	int errorTests = binaryTests(7);
	sample();
	errorTests ^= assertEquals(aSize, 4);
	errorTests ^= (assertEquals(bSize, 4) << 1);
	errorTests ^= (assertEquals(cSize, 1) << 2);
	errorTests ^= (assertEquals(arec, 5) << 3);
	errorTests ^= (assertEquals(brec, 7) << 4);
	errorTests ^= (assertEquals(sample(), 12) << 5);
	errorTests ^= (assertEquals(sample(), arec + brec) << 6);
	printf("%d", errorTests);
	return errorTests;
}
