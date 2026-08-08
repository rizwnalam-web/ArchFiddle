export interface LayerExample {
  layerName: 'Presentation / UI Layer' | 'Business Logic / Domain Layer' | 'Data Access / Infrastructure Layer';
  scenario: string;
  violationCode: string;
  violationExplanation: string;
  solidCode: string;
  solidExplanation: string;
}

export interface SolidPrincipleData {
  id: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP';
  letter: string;
  name: string;
  tagline: string;
  definition: string;
  keyBenefits: string[];
  realWorldAnalogy: string;
  layerExamples: LayerExample[];
}

export const SOLID_PRINCIPLES_DATA: Record<string, SolidPrincipleData> = {
  SRP: {
    id: 'SRP',
    letter: 'S',
    name: 'Single Responsibility Principle',
    tagline: 'A class or module should have one, and only one, reason to change.',
    definition: 'Every module or class should be responsible for a single part of the application functionality, and that responsibility should be entirely encapsulated by the class. High cohesion leads to resilient, easily testable software.',
    keyBenefits: [
      'Easier Unit Testing: Testing isolated responsibilities requires minimal mocking.',
      'Reduced Merge Conflicts: Developers working on separate features touch distinct files.',
      'Higher Reusability: Small, focused utilities can be composed across multiple features.'
    ],
    realWorldAnalogy: 'A Swiss Army knife has many tools in one handle, but if you bend the scissors, you might break the entire casing. A surgeon uses distinct, single-purpose surgical tools.',
    layerExamples: [
      {
        layerName: 'Presentation / UI Layer',
        scenario: 'User Profile Dashboard Component',
        violationCode: `// ❌ VIOLATION: Component fetches data, validates inputs, formats dates, and renders UI
export function UserProfileCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  const handleUpdateEmail = async () => {
    if (!email.includes('@')) {
      alert('Invalid email format');
      return;
    }
    await fetch(\`/api/users/\${userId}\`, {
      method: 'PATCH',
      body: JSON.stringify({ email })
    });
  };

  return (
    <div>
      <h2>{user?.name?.toUpperCase()}</h2>
      <p>Joined: {new Date(user?.createdAt).toLocaleDateString()}</p>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleUpdateEmail}>Save Email</button>
    </div>
  );
}`,
        violationExplanation: 'This single React component has 4 reasons to change: UI styling updates, API endpoint change, email validation rule changes, or date formatting requirements.',
        solidCode: `// ✅ SRP REFACTORED: Separating Data/Validation hook from Pure View Component

// 1. Single Responsibility: Custom Hook handles state & network logic
export function useUserProfile(userId: string) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    UserService.getById(userId).then(setUser);
  }, [userId]);

  const updateEmail = async (newEmail: string) => {
    if (!validateEmail(newEmail)) throw new Error('Invalid email');
    const updated = await UserService.updateEmail(userId, newEmail);
    setUser(updated);
  };

  return { user, updateEmail };
}

// 2. Single Responsibility: Presentational Component only renders UI
export function UserProfileCard({ userId }: { userId: string }) {
  const { user, updateEmail } = useUserProfile(userId);
  const [emailInput, setEmailInput] = useState('');

  if (!user) return <Spinner />;

  return (
    <div className="card">
      <h2>{user.displayName}</h2>
      <p>Joined: {formatUserDate(user.createdAt)}</p>
      <input value={emailInput} onChange={e => setEmailInput(e.target.value)} />
      <button onClick={() => updateEmail(emailInput)}>Save Email</button>
    </div>
  );
}`,
        solidExplanation: 'By extracting custom hooks and utility functions, the UI component is purely concerned with layout, while data fetching and validation can be tested independently without mounting React DOM.'
      },
      {
        layerName: 'Business Logic / Domain Layer',
        scenario: 'E-Commerce Order Processing Engine',
        violationCode: `// ❌ VIOLATION: OrderProcessor calculates taxes, applies discounts, charges credit card, and sends PDF receipt emails.
export class OrderProcessor {
  processOrder(order: Order) {
    // 1. Calculate Tax
    let tax = 0;
    if (order.state === 'NY') tax = order.subtotal * 0.08875;
    
    // 2. Charge Stripe
    const stripe = new StripeAPI('secret_key');
    stripe.charge(order.total + tax);

    // 3. Save to DB
    const db = new DatabaseConnection();
    db.query('INSERT INTO orders ...');

    // 4. Send Email
    const nodemailer = require('nodemailer');
    nodemailer.sendMail({ to: order.customerEmail, subject: 'Order Confirmation' });
  }
}`,
        violationExplanation: 'If tax rules change, or Stripe updates SDK, or email template is modified, this single class must be re-edited and re-tested, risking breakages in payment processing.',
        solidCode: `// ✅ SRP REFACTORED: Dedicated domain services with single responsibilities

export class TaxCalculator {
  calculateTax(subtotal: number, state: string): number {
    return state === 'NY' ? subtotal * 0.08875 : subtotal * 0.05;
  }
}

export class OrderService {
  constructor(
    private taxCalc: TaxCalculator,
    private paymentGateway: IPaymentGateway,
    private orderRepo: IOrderRepository,
    private notifier: INotificationService
  ) {}

  async processOrder(order: Order): Promise<void> {
    const tax = this.taxCalc.calculateTax(order.subtotal, order.state);
    const finalAmount = order.subtotal + tax;

    await this.paymentGateway.charge(order.id, finalAmount);
    await this.orderRepo.save(order);
    await this.notifier.sendOrderConfirmation(order.customerEmail, order.id);
  }
}`,
        solidExplanation: 'Each domain class handles a single domain responsibility (Tax, Storage, Payment, Notification). The `OrderService` orchestrates them cleanly.'
      },
      {
        layerName: 'Data Access / Infrastructure Layer',
        scenario: 'Database Repository & Analytics Logging',
        violationCode: `// ❌ VIOLATION: UserRepository mixes SQL queries with Redis Caching and CloudWatch Telemetry logging
export class UserRepository {
  async findById(id: string) {
    // Log telemetry
    console.log(\`[CloudWatch] DB Query Started for \${id}\`);
    
    // Check Cache
    const cached = await redisClient.get(\`user:\${id}\`);
    if (cached) return JSON.parse(cached);

    // SQL Query
    const user = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    // Write Cache
    await redisClient.set(\`user:\${id}\`, JSON.stringify(user));
    return user;
  }
}`,
        violationExplanation: 'Couples SQL persistence with Redis caching strategies and telemetry logs. Changing cache TTL or logging providers breaks data access code.',
        solidCode: `// ✅ SRP REFACTORED: Clean SQL Repository + Cached Repository Decorator

// 1. Pure Database Repository (Data Access only)
export class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
}

// 2. Separate Cache Decorator (Caching responsibility only)
export class CachedUserRepository implements IUserRepository {
  constructor(
    private innerRepo: IUserRepository,
    private cache: ICacheStorage
  ) {}

  async findById(id: string): Promise<User | null> {
    const cached = await this.cache.get<User>(\`user:\${id}\`);
    if (cached) return cached;

    const user = await this.innerRepo.findById(id);
    if (user) await this.cache.set(\`user:\${id}\`, user, 3600);
    return user;
  }
}`,
        solidExplanation: 'PostgresUserRepository only knows SQL. CachedUserRepository only manages cache delegation. Both adhere to IUserRepository interface.'
      }
    ]
  },
  OCP: {
    id: 'OCP',
    letter: 'O',
    name: 'Open/Closed Principle',
    tagline: 'Software entities should be open for extension, but closed for modification.',
    definition: 'You should be able to extend a module or class behavior without modifying its existing source code. This is usually achieved using abstractions, interfaces, and polymorphism.',
    keyBenefits: [
      'Zero Regression Risk: New features do not alter existing, battle-tested code.',
      'Scalable Feature Expansion: Add new strategies, rules, or providers seamlessly.',
      'Modular Plugin Architecture: Third-party extensions can hook in easily.'
    ],
    realWorldAnalogy: 'An electrical wall socket is closed for modification (you do not alter internal wiring to plug in a lamp), but open for extension (you plug in any appliance with a standard plug).',
    layerExamples: [
      {
        layerName: 'Presentation / UI Layer',
        scenario: 'Dynamic Payment Form Component',
        violationCode: `// ❌ VIOLATION: Adding a new payment method (e.g. Apple Pay) requires editing switch cases inside the component
export function PaymentMethodForm({ type }: { type: 'card' | 'paypal' | 'crypto' }) {
  if (type === 'card') {
    return <CreditCardInputs />;
  } else if (type === 'paypal') {
    return <PayPalButton />;
  } else if (type === 'crypto') {
    return <CryptoWalletConnect />;
  }
  return null;
}`,
        violationExplanation: 'Every time your business accepts a new payment method (Klarna, ApplePay, GooglePay), you must open and modify `PaymentMethodForm`, increasing bug risk for existing methods.',
        solidCode: `// ✅ OCP REFACTORED: Registry / Polymorphic Component Pattern

// 1. Interface for Payment Widget
export interface PaymentWidgetProps {
  onSuccess: (paymentId: string) => void;
}

// 2. Payment Component Registry (Open for extension)
const paymentWidgetRegistry: Record<string, React.ComponentType<PaymentWidgetProps>> = {
  card: CreditCardInputs,
  paypal: PayPalButton,
  crypto: CryptoWalletConnect,
};

// Function to register new payment widgets without editing PaymentMethodForm
export function registerPaymentWidget(id: string, component: React.ComponentType<PaymentWidgetProps>) {
  paymentWidgetRegistry[id] = component;
}

// 3. Form Component (Closed for modification)
export function PaymentMethodForm({ type, onSuccess }: { type: string; onSuccess: (id: string) => void }) {
  const Widget = paymentWidgetRegistry[type];
  if (!Widget) return <div>Unsupported Payment Method</div>;
  return <Widget onSuccess={onSuccess} />;
}`,
        solidExplanation: 'New payment integrations register themselves with the registry. `PaymentMethodForm` never needs code edits when adding new methods.'
      },
      {
        layerName: 'Business Logic / Domain Layer',
        scenario: 'Dynamic Discount Engine',
        violationCode: `// ❌ VIOLATION: Hardcoded conditional branches for discounts
export class DiscountEngine {
  calculateDiscount(customerType: string, total: number): number {
    if (customerType === 'REGULAR') return total * 0.05;
    if (customerType === 'VIP') return total * 0.20;
    if (customerType === 'BLACK_FRIDAY') return total * 0.35;
    // Adding 'SENIOR' or 'STUDENT' forces editing this method!
    return 0;
  }
}`,
        violationExplanation: 'Adding seasonal, promotional, or tier-based discount rules requires editing the core `calculateDiscount` method repeatedly.',
        solidCode: `// ✅ OCP REFACTORED: Strategy Pattern with Interfaces

export interface IDiscountStrategy {
  isApplicable(context: DiscountContext): boolean;
  applyDiscount(total: number): number;
}

export class VIPDiscountStrategy implements IDiscountStrategy {
  isApplicable(ctx: DiscountContext) { return ctx.customerTier === 'VIP'; }
  applyDiscount(total: number) { return total * 0.20; }
}

export class StudentDiscountStrategy implements IDiscountStrategy {
  isApplicable(ctx: DiscountContext) { return ctx.isStudent; }
  applyDiscount(total: number) { return total * 0.15; }
}

// DiscountEngine iterates strategies (Open to new strategies, Closed to modifications)
export class DiscountEngine {
  constructor(private strategies: IDiscountStrategy[]) {}

  calculate(ctx: DiscountContext, total: number): number {
    const strategy = this.strategies.find(s => s.isApplicable(ctx));
    return strategy ? strategy.applyDiscount(total) : 0;
  }
}`,
        solidExplanation: 'To add a Student or Holiday discount, simply instantiate a new class implementing `IDiscountStrategy`. The `DiscountEngine` source code remains untouched.'
      },
      {
        layerName: 'Data Access / Infrastructure Layer',
        scenario: 'Notification / Messaging Storage Export',
        violationCode: `// ❌ VIOLATION: Exporting audit logs directly handles format checks
export class AuditLogExporter {
  exportLogs(logs: LogEntry[], format: 'CSV' | 'JSON' | 'XML') {
    if (format === 'CSV') {
      return logs.map(l => \`\${l.id},\${l.action}\`).join('\\n');
    } else if (format === 'JSON') {
      return JSON.stringify(logs);
    }
    // Adding Parquet or PDF requires modifying this class!
  }
}`,
        violationExplanation: 'Adding export formats (e.g., Parquet, Excel, PDF) pollutes the exporter class with formatting details.',
        solidCode: `// ✅ OCP REFACTORED: Formatter Strategy Abstraction

export interface ILogFormatter {
  format(logs: LogEntry[]): string | Buffer;
}

export class CsvLogFormatter implements ILogFormatter {
  format(logs: LogEntry[]): string {
    return logs.map(l => \`\${l.id},\${l.action}\`).join('\\n');
  }
}

export class ParquetLogFormatter implements ILogFormatter {
  format(logs: LogEntry[]): Buffer {
    // Parquet binary serialization logic
    return Buffer.from(...);
  }
}

export class AuditLogExporter {
  exportLogs(logs: LogEntry[], formatter: ILogFormatter) {
    return formatter.format(logs);
  }
}`,
        solidExplanation: 'Pass any formatter implementing `ILogFormatter`. `AuditLogExporter` is completely decoupled from concrete file formats.'
      }
    ]
  },
  LSP: {
    id: 'LSP',
    letter: 'L',
    name: 'Liskov Substitution Principle',
    tagline: 'Subtypes must be substitutable for their base types without breaking expected contract behavior.',
    definition: 'If S is a subtype of T, then objects of type T may be replaced with objects of type S without altering any of the desirable properties of the program (correctness, performance, or exceptions).',
    keyBenefits: [
      'Reliable Polymorphic Substitution: Swap subclasses or implementations safely.',
      'Prevents Defensive Typing: Eliminates `if (obj instanceof SubClass)` type checks.',
      'Contract Guarantee: Derived types respect preconditions, postconditions, and invariants.'
    ],
    realWorldAnalogy: 'If it looks like a duck and quacks like a duck, but needs batteries, you probably have the wrong abstraction (it violates Liskov Substitution).',
    layerExamples: [
      {
        layerName: 'Presentation / UI Layer',
        scenario: 'Form Input Component Hierarchy',
        violationCode: `// ❌ VIOLATION: ReadOnlyInput extends TextInput but throws runtime error on onChange
export class TextInput extends React.Component<{ value: string; onChange: (v: string) => void }> {
  render() {
    return <input value={this.props.value} onChange={e => this.props.onChange(e.target.value)} />;
  }
}

export class ReadOnlyInput extends TextInput {
  render() {
    if (this.props.onChange) {
      // Throws error if parent passes onChange! Violates base class expectations.
      throw new Error('ReadOnlyInput does not support onChange');
    }
    return <span>{this.props.value}</span>;
  }
}`,
        violationExplanation: 'A component expecting `TextInput` cannot safely use `ReadOnlyInput` as a substitute because it throws unexpected exceptions on valid inputs.',
        solidCode: `// ✅ LSP REFACTORED: Separate interfaces or composition over inheritance

export interface BaseInputProps {
  value: string;
  label: string;
}

export interface EditableInputProps extends BaseInputProps {
  onChange: (value: string) => void;
}

export function TextInput({ value, label, onChange }: EditableInputProps) {
  return (
    <div>
      <label>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function ReadOnlyDisplay({ value, label }: BaseInputProps) {
  return (
    <div>
      <label>{label}</label>
      <span className="readonly-val">{value}</span>
    </div>
  );
}`,
        solidExplanation: 'By splitting props interfaces, `ReadOnlyDisplay` never promises interactive `onChange` capabilities it cannot deliver.'
      },
      {
        layerName: 'Business Logic / Domain Layer',
        scenario: 'Payment Gateway Abstraction with Partial Support',
        violationCode: `// ❌ VIOLATION: CryptoPaymentGateway breaks refund contract by throwing NotSupportedException
export interface IPaymentGateway {
  processPayment(amount: number): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
}

export class CryptoPaymentGateway implements IPaymentGateway {
  async processPayment(amount: number) { return { status: 'SUCCESS' }; }

  async refund(transactionId: string) {
    // ❌ VIOLATION: Crypto transactions are non-refundable on-chain!
    throw new Error('Refunds not supported for crypto payments!');
  }
}`,
        violationExplanation: 'Code calling `gateway.refund()` will crash if given a `CryptoPaymentGateway`. Subtype breaks base contract assumptions.',
        solidCode: `// ✅ LSP REFACTORED: Segregated Capabilities or Capability Interfaces

export interface IPaymentGateway {
  processPayment(amount: number): Promise<PaymentResult>;
}

export interface IRefundablePaymentGateway extends IPaymentGateway {
  refund(transactionId: string): Promise<RefundResult>;
}

export class CreditCardGateway implements IRefundablePaymentGateway {
  async processPayment(amount: number) { return { status: 'SUCCESS' }; }
  async refund(txId: string) { return { status: 'REFUNDED' }; }
}

export class CryptoPaymentGateway border implements IPaymentGateway {
  async processPayment(amount: number) { return { status: 'SUCCESS' }; }
}`,
        solidExplanation: 'Only gateways that truly support refunds implement `IRefundablePaymentGateway`. Higher-level domain services only call `refund()` on gateways explicitly implementing that capability.'
      },
      {
        layerName: 'Data Access / Infrastructure Layer',
        scenario: 'File Storage Adapter Hierarchy',
        violationCode: `// ❌ VIOLATION: LocalDiskStorage returns local file path string, while S3Storage returns HTTP URL
export interface IFileStorage {
  uploadFile(filename: string, content: Buffer): Promise<string>;
}

export class LocalDiskStorage implements IFileStorage {
  async uploadFile(filename: string, content: Buffer) {
    // Returns local path: "/var/data/uploads/avatar.png"
    return \`/var/data/uploads/\${filename}\`;
  }
}

export class S3Storage implements IFileStorage {
  async uploadFile(filename: string, content: Buffer) {
    // Returns public web URL: "https://mybucket.s3.amazonaws.com/avatar.png"
    return \`https://mybucket.s3.amazonaws.com/\${filename}\`;
  }
}`,
        violationExplanation: 'Consumers expecting an HTTP web URL break if given `LocalDiskStorage` because local file paths cannot be loaded in modern web browsers directly.',
        solidCode: `// ✅ LSP REFACTORED: Consistent Return Type & Semantic Guarantees

export interface FileUploadResult {
  fileKey: string;
  publicUrl: string;
}

export interface IFileStorage {
  uploadFile(filename: string, content: Buffer): Promise<FileUploadResult>;
}

export class LocalDiskStorage implements IFileStorage {
  async uploadFile(filename: string, content: Buffer): Promise<FileUploadResult> {
    // Both return valid web-accessible URLs (e.g. local dev proxy URL)
    return {
      fileKey: filename,
      publicUrl: \`http://localhost:3000/files/\${filename}\`
    };
  }
}

export class S3Storage implements IFileStorage {
  async uploadFile(filename: string, content: Buffer): Promise<FileUploadResult> {
    return {
      fileKey: filename,
      publicUrl: \`https://mybucket.s3.amazonaws.com/\${filename}\`
    };
  }
}`,
        solidExplanation: 'Both implementations fulfill identical preconditions and return structures, guaranteeing seamless substitution between local dev environments and cloud S3 buckets.'
      }
    ]
  },
  ISP: {
    id: 'ISP',
    letter: 'I',
    name: 'Interface Segregation Principle',
    tagline: 'Clients should not be forced to depend upon interfaces or properties they do not use.',
    definition: 'Many client-specific interfaces are better than one general-purpose interface. Keep interfaces lean, focused, and minimal to prevent bloated coupling.',
    keyBenefits: [
      'Minimal Component Props: Components only request fields they actually render.',
      'Reduced Module Coupling: Changes to unused methods do not force recompilation.',
      'Easier Mocking in Tests: Mocks only implement 1-2 needed methods rather than 20.'
    ],
    realWorldAnalogy: 'A restaurant menu with 500 items is overwhelming. Separate menus for Breakfast, Drinks, and Desserts are easier to navigate and maintain.',
    layerExamples: [
      {
        layerName: 'Presentation / UI Layer',
        scenario: 'React Component Props Bloat',
        violationCode: `// ❌ VIOLATION: UserAvatar demands full monolithic User entity including sensitive or unnecessary data
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  hashedPassword: string;
  billingAddress: Address;
  creditCardLast4: string;
}

export function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />;
}`,
        violationExplanation: '`UserAvatar` only needs `name` and `avatarUrl`, but forces caller to pass entire `User` object, making component reusability difficult when dealing with partial user objects.',
        solidCode: `// ✅ ISP REFACTORED: Segregated, Minimal Component Interface

export interface AvatarProps {
  name: string;
  avatarUrl: string;
}

export function UserAvatar({ name, avatarUrl }: AvatarProps) {
  return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full" />;
}`,
        solidExplanation: '`UserAvatar` now accepts any object with `name` and `avatarUrl` (or primitive props), making it usable for team members, comments, or external authors.'
      },
      {
        layerName: 'Business Logic / Domain Layer',
        scenario: 'Fat Domain Repository Interface',
        violationCode: `// ❌ VIOLATION: Giant monolithic order processor interface
export interface IOrderProcessor {
  createOrder(order: Order): Promise<void>;
  cancelOrder(id: string): Promise<void>;
  generateMonthlyReport(month: number): Promise<Report>;
  purgeArchivedOrders(): Promise<void>;
  reconcileTaxLedger(): Promise<void>;
}

// A simple Customer Order Service only needs createOrder & cancelOrder, but is forced to depend on report & purge methods!`,
        violationExplanation: 'Changes to `generateMonthlyReport` force recompilation or re-testing of simple checkout features.',
        solidCode: `// ✅ ISP REFACTORED: Segregated Role Interfaces

export interface IOrderCreator {
  createOrder(order: Order): Promise<void>;
}

export interface IOrderCanceller {
  cancelOrder(id: string): Promise<void>;
}

export interface IOrderReporter {
  generateMonthlyReport(month: number): Promise<Report>;
}

// Customer Checkout only depends on IOrderCreator
export class CustomerCheckoutService {
  constructor(private orderCreator: IOrderCreator) {}

  async checkout(order: Order) {
    await this.orderCreator.createOrder(order);
  }
}`,
        solidExplanation: 'Services receive fine-grained interfaces containing strictly the methods they execute.'
      },
      {
        layerName: 'Data Access / Infrastructure Layer',
        scenario: 'Read-Only vs Read-Write DB Connectors',
        violationCode: `// ❌ VIOLATION: Read-only replica worker forced to expose write/delete operations
export interface IDatabaseClient {
  query<T>(sql: string): Promise<T[]>;
  insert(table: string, data: any): Promise<void>;
  delete(table: string, id: string): Promise<void>;
}

export class ReadOnlyReplicaClient implements IDatabaseClient {
  async query<T>(sql: string) { return pgReplica.query(sql); }
  async insert() { throw new Error('Read-only DB!'); }
  async delete() { throw new Error('Read-only DB!'); }
}`,
        violationExplanation: 'Analytics reporting modules calling `ReadOnlyReplicaClient` might accidentally call `insert` or `delete`, failing at runtime.',
        solidCode: `// ✅ ISP REFACTORED: Split Read / Write Interfaces

export interface IReadRepository {
  query<T>(sql: string): Promise<T[]>;
}

export interface IWriteRepository {
  insert(table: string, data: any): Promise<void>;
  delete(table: string, id: string): Promise<void>;
}

export class AnalyticsService {
  constructor(private readDb: IReadRepository) {}
  
  async generateAnalytics() {
    return this.readDb.query('SELECT count(*) FROM events');
  }
}`,
        solidExplanation: 'Analytics services only accept `IReadRepository`, ensuring compile-time safety against accidental mutations.'
      }
    ]
  },
  DIP: {
    id: 'DIP',
    letter: 'D',
    name: 'Dependency Inversion Principle',
    tagline: 'High-level modules should not depend on low-level modules. Both should depend on abstractions.',
    definition: 'Abstractions should not depend on details. Details (concrete implementations) should depend on abstractions. This enables loose coupling, flexible architecture, and effortless testing.',
    keyBenefits: [
      'Decoupled Infrastructure: Swap MySQL for MongoDB or SendGrid for AWS SES seamlessly.',
      'Unit Testability: High-level business logic is tested with fast in-memory mocks.',
      'Hexagonal Architecture Alignment: Clean separation between Domain Core and External Drivers.'
    ],
    realWorldAnalogy: 'Your phone charger plugs into a standardized wall socket (abstraction), not directly soldered into the electrical grid wiring (concrete low-level detail).',
    layerExamples: [
      {
        layerName: 'Presentation / UI Layer',
        scenario: 'React Component Analytics Logging',
        violationCode: `// ❌ VIOLATION: Component directly imports concrete GoogleAnalytics SDK
import { mixpanel } from 'mixpanel-browser';

export function CheckoutButton() {
  const handleClick = () => {
    // ❌ Tightly coupled to Mixpanel SDK directly inside UI code!
    mixpanel.track('Checkout Clicked', { timestamp: Date.now() });
  };

  return <button onClick={handleClick}>Complete Purchase</button>;
}`,
        violationExplanation: 'If marketing decides to switch from Mixpanel to Segment or Amplitude, you must manually hunt down and replace imports across 50+ React components.',
        solidCode: `// ✅ DIP REFACTORED: Dependency Injection via Context / Hook Abstraction

// 1. Abstraction Interface
export interface IAnalyticsService {
  trackEvent(name: string, payload?: Record<string, any>): void;
}

// 2. React Context providing abstraction
const AnalyticsContext = React.createContext<IAnalyticsService>(new ConsoleAnalyticsService());

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

// 3. UI Component depends ONLY on abstraction hook
export function CheckoutButton() {
  const analytics = useAnalytics();

  return (
    <button onClick={() => analytics.trackEvent('Checkout Clicked')}>
      Complete Purchase
    </button>
  );
}`,
        solidExplanation: 'The React component knows nothing about Mixpanel or Segment. Switching providers is as simple as updating the `AnalyticsProvider` wrapper at app root.'
      },
      {
        layerName: 'Business Logic / Domain Layer',
        scenario: 'Order Notification Dispatcher',
        violationCode: `// ❌ VIOLATION: High-level OrderService instantiates concrete SendGrid & Twilio clients
import { SendGridClient } from 'sendgrid';
import { TwilioSMSClient } from 'twilio';

export class OrderService {
  private emailClient = new SendGridClient('SG.key...');
  private smsClient = new TwilioSMSClient('TW.key...');

  async completeOrder(order: Order) {
    // Concrete low-level execution
    await this.emailClient.sendEmail(order.email, 'Order Confirmed');
    await this.smsClient.sendSMS(order.phone, 'Order Confirmed');
  }
}`,
        violationExplanation: 'Unit testing `OrderService` without sending real emails or real SMS messages is nearly impossible because concrete clients are hardcoded inside constructor.',
        solidCode: `// ✅ DIP REFACTORED: Interface Abstraction & Constructor Injection

export interface INotificationProvider {
  notify(recipient: string, message: string): Promise<void>;
}

export class OrderService {
  constructor(
    private emailNotifier: INotificationProvider,
    private smsNotifier: INotificationProvider
  ) {}

  async completeOrder(order: Order) {
    await this.emailNotifier.notify(order.email, 'Order Confirmed');
    await this.smsNotifier.notify(order.phone, 'Order Confirmed');
  }
}`,
        solidExplanation: '`OrderService` depends on `INotificationProvider` interface. In tests, pass `MockNotificationProvider`. In production, pass `SendGridProvider` and `TwilioProvider`.'
      },
      {
        layerName: 'Data Access / Infrastructure Layer',
        scenario: 'Clean Architecture Domain Repository Rule',
        violationCode: `// ❌ VIOLATION: High-level Domain Entity depends directly on MongoDbDriver
import { MongoClient } from 'mongodb';

export class UserDomainService {
  async registerUser(userData: any) {
    // Directly accessing MongoDB SDK in domain layer!
    const client = await MongoClient.connect('mongodb://localhost');
    const db = client.db('myapp');
    await db.collection('users').insertOne(userData);
  }
}`,
        violationExplanation: 'Domain layer becomes dependent on MongoDB vendor driver. Migration to PostgreSQL or DynamoDB breaks domain business rules.',
        solidCode: `// ✅ DIP REFACTORED: Hexagonal / Clean Architecture

// 1. Interface declared IN DOMAIN LAYER
export interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

// 2. High-level Domain Service depends ONLY on domain interface
export class UserDomainService {
  constructor(private userRepo: IUserRepository) {}

  async registerUser(user: User) {
    const existing = await this.userRepo.findByEmail(user.email);
    if (existing) throw new Error('User already exists');
    await this.userRepo.save(user);
  }
}

// 3. Infrastructure Layer implements Domain Interface
export class MongoUserRepository implements IUserRepository {
  async save(user: User) { /* Mongo specific logic */ }
  async findByEmail(email: string) { /* Mongo specific logic */ }
}`,
        solidExplanation: 'The high-level domain (`UserDomainService`) defines the interface contract `IUserRepository`. The low-level database details (`MongoUserRepository`) adapt to it.'
      }
    ]
  }
};
