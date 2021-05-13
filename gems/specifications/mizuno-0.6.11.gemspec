# -*- encoding: utf-8 -*-
# stub: mizuno 0.6.11 ruby lib

Gem::Specification.new do |s|
  s.name = "mizuno".freeze
  s.version = "0.6.11"

  s.required_rubygems_version = Gem::Requirement.new(">= 1.2".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Don Werve".freeze]
  s.date = "2015-06-06"
  s.description = "Jetty-powered running shoes for JRuby/Rack.".freeze
  s.email = "don@madwombat.com".freeze
  s.executables = ["mizuno".freeze]
  s.files = ["bin/mizuno".freeze]
  s.homepage = "http://github.com/matadon/mizuno".freeze
  s.rubygems_version = "2.6.14.1".freeze
  s.summary = "Rack handler for Jetty 8 on JRuby. Features multithreading, event-driven I/O, and async support.".freeze

  s.installed_by_version = "2.6.14.1" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<rack>.freeze, [">= 1.0.0"])
      s.add_runtime_dependency(%q<ffi>.freeze, [">= 1.0.0"])
      s.add_runtime_dependency(%q<choice>.freeze, [">= 0.1.0"])
      s.add_runtime_dependency(%q<childprocess>.freeze, [">= 0.2.6"])
      s.add_development_dependency(%q<rake>.freeze, [">= 0"])
      s.add_development_dependency(%q<rspec>.freeze, [">= 2.7.0"])
      s.add_development_dependency(%q<rspec-core>.freeze, [">= 2.7.0"])
      s.add_development_dependency(%q<json_pure>.freeze, [">= 1.6.0"])
      s.add_development_dependency(%q<nokogiri>.freeze, [">= 0"])
    else
      s.add_dependency(%q<rack>.freeze, [">= 1.0.0"])
      s.add_dependency(%q<ffi>.freeze, [">= 1.0.0"])
      s.add_dependency(%q<choice>.freeze, [">= 0.1.0"])
      s.add_dependency(%q<childprocess>.freeze, [">= 0.2.6"])
      s.add_dependency(%q<rake>.freeze, [">= 0"])
      s.add_dependency(%q<rspec>.freeze, [">= 2.7.0"])
      s.add_dependency(%q<rspec-core>.freeze, [">= 2.7.0"])
      s.add_dependency(%q<json_pure>.freeze, [">= 1.6.0"])
      s.add_dependency(%q<nokogiri>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<rack>.freeze, [">= 1.0.0"])
    s.add_dependency(%q<ffi>.freeze, [">= 1.0.0"])
    s.add_dependency(%q<choice>.freeze, [">= 0.1.0"])
    s.add_dependency(%q<childprocess>.freeze, [">= 0.2.6"])
    s.add_dependency(%q<rake>.freeze, [">= 0"])
    s.add_dependency(%q<rspec>.freeze, [">= 2.7.0"])
    s.add_dependency(%q<rspec-core>.freeze, [">= 2.7.0"])
    s.add_dependency(%q<json_pure>.freeze, [">= 1.6.0"])
    s.add_dependency(%q<nokogiri>.freeze, [">= 0"])
  end
end
