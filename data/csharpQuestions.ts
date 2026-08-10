import { InterviewQuestion } from './interviewPrepData';
import { CSHARP_PART1 } from './csharpPart1';
import { CSHARP_PART2 } from './csharpPart2';
import { CSHARP_PART3 } from './csharpPart3';
import { CSHARP_PART4 } from './csharpPart4';
import { CSHARP_PART5 } from './csharpPart5';
import { CSHARP_PART6 } from './csharpPart6';
import { CSHARP_PART7 } from './csharpPart7';
import { CSHARP_PART8 } from './csharpPart8';
import { CSHARP_PART9 } from './csharpPart9';
import { CSHARP_PART10 } from './csharpPart10';

export const CSHARP_QUESTIONS: InterviewQuestion[] = [
  ...CSHARP_PART1,
  ...CSHARP_PART2,
  ...CSHARP_PART3,
  ...CSHARP_PART4,
  ...CSHARP_PART5,
  ...CSHARP_PART6,
  ...CSHARP_PART7,
  ...CSHARP_PART8,
  ...CSHARP_PART9,
  ...CSHARP_PART10
];

// Backward compatibility export
export const TOP_20_CSHARP: InterviewQuestion[] = CSHARP_QUESTIONS;
export const TOP_20_CSHARP_NET: InterviewQuestion[] = CSHARP_QUESTIONS;
export const TOP_100_CSHARP: InterviewQuestion[] = CSHARP_QUESTIONS;
