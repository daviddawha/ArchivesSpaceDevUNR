# -*- encoding: utf-8 -*-
# stub: saxon-xslt 0.8.2.2 java lib

Gem::Specification.new do |s|
  s.name = "saxon-xslt".freeze
  s.version = "0.8.2.2"
  s.platform = "java".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Matt Patterson".freeze]
  s.date = "2019-09-02"
  s.description = "Wraps the Saxon 9.8 HE XSLT 2.0 processor so that you can transform XSLT 2 stylesheets in JRuby. Sticks closely to the Nokogiri API".freeze
  s.email = ["matt@reprocessed.org".freeze]
  s.homepage = "https://github.com/fidothe/saxon-xslt".freeze
  s.licenses = ["MIT".freeze, "MPL-1.0".freeze]
  s.rubygems_version = "2.6.14.1".freeze
  s.summary = "Saxon 9.8 HE XSLT 2.0 for JRuby with Nokogiri's API".freeze

  s.installed_by_version = "2.6.14.1" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rake>.freeze, ["~> 11.3"])
      s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0"])
      s.add_development_dependency(%q<vcr>.freeze, ["~> 4.0"])
      s.add_development_dependency(%q<addressable>.freeze, ["~> 2.4.0"])
      s.add_development_dependency(%q<webmock>.freeze, ["~> 2.3.2"])
      s.add_development_dependency(%q<yard>.freeze, ["~> 0.9.12"])
      s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.15"])
    else
      s.add_dependency(%q<rake>.freeze, ["~> 11.3"])
      s.add_dependency(%q<rspec>.freeze, ["~> 3.0"])
      s.add_dependency(%q<vcr>.freeze, ["~> 4.0"])
      s.add_dependency(%q<addressable>.freeze, ["~> 2.4.0"])
      s.add_dependency(%q<webmock>.freeze, ["~> 2.3.2"])
      s.add_dependency(%q<yard>.freeze, ["~> 0.9.12"])
      s.add_dependency(%q<simplecov>.freeze, ["~> 0.15"])
    end
  else
    s.add_dependency(%q<rake>.freeze, ["~> 11.3"])
    s.add_dependency(%q<rspec>.freeze, ["~> 3.0"])
    s.add_dependency(%q<vcr>.freeze, ["~> 4.0"])
    s.add_dependency(%q<addressable>.freeze, ["~> 2.4.0"])
    s.add_dependency(%q<webmock>.freeze, ["~> 2.3.2"])
    s.add_dependency(%q<yard>.freeze, ["~> 0.9.12"])
    s.add_dependency(%q<simplecov>.freeze, ["~> 0.15"])
  end
end
