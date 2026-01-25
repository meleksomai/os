import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Markdown,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "../tailwind.config";

interface GenericEmailProps {
  previewMessage?: string;
  content?: string;
  footer: string;
}

export const GenericEmail = ({
  content,
  footer,
  previewMessage,
}: GenericEmailProps) => (
  <Html>
    <Head />
    <Tailwind config={tailwindConfig}>
      <Body className="bg-white font-default">
        {previewMessage ? <Preview>{previewMessage}</Preview> : null}
        <Container className="mx-auto py-5 pb-12">
          <Markdown
            markdownCustomStyles={{
              p: {
                fontSize: "16px",
                lineHeight: "26px",
              },
            }}
          >
            {content || ""}
          </Markdown>
          <Hr className="my-5 border-[#cccccc]" />
          <Text className="text-[#8898aa] text-[12px]" />
          <Markdown
            markdownCustomStyles={{
              p: {
                color: "gray",
                fontSize: "12px",
              },
              link: {
                color: "gray",
                textDecoration: "underline",
                fontSize: "12px",
              },
            }}
          >
            {footer}
          </Markdown>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

GenericEmail.PreviewProps = {
  footer:
    "Crafted with focus | [somai.me](https://somai.me) | [hello@somai.me](mailto:hello@somai.me)",
  content:
    "Hey there,\n\nThank you for reaching out. I will get back to you as soon as I can.\n\nIn the meantime, feel free to explore my [website](https://somai.me) to learn more about my work and projects.\n\nLooking forward to connecting with you!\n",
} as GenericEmailProps;

export default GenericEmail;
